import express from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { emailQuerySchema } from "../schemas/email.schema";
import { validateQuery } from "../middleware/validate";
import { prisma } from "database";
import path from "path";
import { google } from "googleapis";
import fs from "fs";
import { fetchPlacementMails } from "../utils/gmailParser";

const router = express.Router();
const activeSyncOptions = new Set<string>();

router.get(
  "/",
  authenticateToken,
  validateQuery(emailQuerySchema),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { page, limit } = (req as any).validateQuery;
      const skip = (page - 1) * limit;

      const [emails, total] = await Promise.all([
        prisma.placementMail.findMany({
          where: { userId },
          orderBy: { receivedAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.placementMail.count({
          where: { userId },
        }),
      ]);

      const emailsWithParsedData = emails.map((email) => ({
        ...email,
        otherLinks: email.otherLinks ? JSON.parse(email.otherLinks) : null,
        attachments: email.attachments ? JSON.parse(email.attachments) : null,
      }));

      res.json({
        success: true,
        count: emails.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        emails: emailsWithParsedData,
      });
    } catch (error) {
      console.error("Error fetching emails:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch emails",
      });
    }
  },
);

//helper function to refresh token if expired
async function getValidAccessToken(userId: string): Promise<string | null> {
  const gmailToken = await prisma.gmailToken.findUnique({
    where: { userId },
  });

  if (!gmailToken) return null;

  const now = new Date();
  const isExpired = gmailToken.expiryDate && gmailToken.expiryDate < now;

  if (!isExpired) return gmailToken.accessToken;

  console.log(`Token expired for user ${userId}, refreshing... `);

  if (!gmailToken.refreshToken) {
    console.error(`No refresh token available for user ${userId}`);
    return null;
  }

  try {
    const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    const { client_secret, client_id, redirect_urls } =
      credentials.web || credentials.installed;

    const OAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_urls[0],
    );
    OAuth2Client.setCredentials({
      refresh_token: gmailToken.refreshToken,
    });

    const refreshResponse = await OAuth2Client.refreshAccessToken();
    const newTokens = refreshResponse.credentials;

    await prisma.gmailToken.update({
      where: { userId },
      data: {
        accessToken: newTokens.access_token!,
        expiryDate: newTokens.expiry_date
          ? new Date(newTokens.expiry_date)
          : null,
        updatedAt: new Date(),
      },
    });

    console.log(`Token refresh successfully for user ${userId}`);
    return newTokens.access_token!;
  } catch (error) {
    console.error(`Failed to refresh token for user ${userId}`, error);
    return null;
  }
}

router.post("/sync", authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  if (activeSyncOptions.has(userId)) {
    return res.status(428).json({
      success: false,
      error: "Sync operation already in progress",
    });
  }
  try {
    activeSyncOptions.add(userId);

    const accessToken = await getValidAccessToken(userId);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error:
          "Gmail not connected or token refresh failed. Please reconnect your Google Account",
        requiresReauth: true,
      });
    }

    console.log(`Starting email sync for user: ${userId}`);
    const result = await fetchPlacementMails(userId, accessToken);

    res.json({
      success: true,
      message: "Emails synced successfully",
      stats: result,
    });
  } catch (error) {
    console.error("Error syncing emails: ", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to sync emails";
    const isAuthError =
      errorMessage.includes("Invalid Credentials") ||
      errorMessage.includes("401") ||
      errorMessage.includes("Unauthorized");

    res.status(isAuthError ? 401 : 500).json({
      success: false,
      error: isAuthError
        ? "Authentication failed. Please reconnect your Google Account."
        : errorMessage,
      requiresReauth: isAuthError,
    });
  } finally {
    activeSyncOptions.delete(userId);
  }
});

export default router;
