import { OAuth2Client } from "google-auth-library";
import { prisma } from "database";
import {
  googleTokensSchema,
  googleUserPayloadSchema,
} from "../schemas/google.schema";
import { z } from "zod";
import { signAccessToken, signRefreshToken } from "../utils/jwt";

function validateGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUrl = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUrl) {
    throw new Error(
      "Google OAuth configuration is missing. Please set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REDIRECT_URI environment variables."
    );
  }

  return { clientId, clientSecret, redirectUrl };
}

let _oAuthClient: OAuth2Client | null = null;

export function getOAuthClient(): OAuth2Client {
  if (!_oAuthClient) {
    const { clientId, clientSecret, redirectUrl } = validateGoogleOAuthConfig();
    _oAuthClient = new OAuth2Client({
      clientId,
      clientSecret,
      redirectUri: redirectUrl,
    });
  }

  return _oAuthClient;
}

export function getGoogleAuthURL() {
  const client = getOAuthClient();
  // OAuth2Client is already initialized with redirectUri, no need to pass it again
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    prompt: "consent", // Force consent to get refresh token
  });
  return authUrl;
}

export async function handleGoogleCallBack(code: string) {
  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);

    // Log for debugging
    console.log(
      "Google tokens received - expiry_date type:",
      typeof tokens.expiry_date
    );

    const validatedTokens = googleTokensSchema.parse(tokens);

    if (!validatedTokens.id_token) {
      throw new Error("No id_token received from Google OAuth");
    }

    const ticket = await client.verifyIdToken({
      idToken: validatedTokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error("Invalid user data from Google");
    }

    const validatedPayload = googleUserPayloadSchema.parse(payload);

    const user = await prisma.user.upsert({
      where: {
        email: validatedPayload.email,
      },
      update: {
        name: validatedPayload.name ?? undefined,
        image: validatedPayload.picture ?? undefined,
        provider: "google",
        providerId: validatedPayload.sub ?? undefined,
      },
      create: {
        email: validatedPayload.email,
        name: validatedPayload.name ?? undefined,
        image: validatedPayload.picture ?? undefined,
        provider: "google",
        providerId: validatedPayload.sub ?? undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name ?? undefined,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: refreshToken,
      },
    });

    if (validatedTokens.access_token) {
      await saveUserGmailTokens(user.id, validatedTokens);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  } catch (error) {
    console.error("Google OAuth error", error);
    // Re-throw error so route handler can handle it properly
    throw error;
  }
}
export async function saveUserGmailTokens(
  userId: string,
  tokens: z.infer<typeof googleTokensSchema>
) {
  try {
    const validatedTokens = googleTokensSchema.parse(tokens);

    await prisma.gmailToken.upsert({
      where: {
        userId: userId,
      },
      update: {
        accessToken: validatedTokens.access_token,
        refreshToken: validatedTokens.refresh_token || undefined,
        scope: validatedTokens.scope || undefined,
        tokenType: validatedTokens.token_type || "Bearer",
        expiryDate: validatedTokens.expiry_date
          ? new Date(validatedTokens.expiry_date) // expiry_date is now normalized to number (ms)
          : undefined,
      },
      create: {
        accessToken: validatedTokens.access_token,
        refreshToken: validatedTokens.refresh_token || undefined,
        scope: validatedTokens.scope || undefined,
        tokenType: validatedTokens.token_type || undefined,
        expiryDate: validatedTokens.expiry_date
          ? new Date(validatedTokens.expiry_date) // expiry_date is now normalized to number (ms)
          : undefined,
        userId: userId,
      },
    });
    console.log(`Gmail token saved for user : ${userId}`);
  } catch (error) {
    console.error("Failed to save Gmail tokens", error);
    throw error;
  }
}
