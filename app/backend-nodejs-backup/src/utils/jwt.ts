import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { jwtPayloadSchema } from "../schemas/jwt.schema";

export interface JWTPayload extends JwtPayload {
  userId: string;
  email: string;
  name?: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

function getJwtRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET environment variable is required");
  }
  return secret;
}

export function signAccessToken(
  payload: Omit<JWTPayload, keyof JwtPayload>
): string {
  const validatedPayload = jwtPayloadSchema.parse(payload);
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ||
      "15m") as SignOptions["expiresIn"],
    issuer: "student-email-automation",
    audience: "user",
  };
  return jwt.sign(validatedPayload, getJwtSecret(), options);
}

export function signRefreshToken(
  payload: Omit<JWTPayload, keyof JwtPayload>
): string {
  const validatedPayload = jwtPayloadSchema.parse(payload);
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
      "7d") as SignOptions["expiresIn"],
    issuer: "student-email-automation",
    audience: "user",
  };
  return jwt.sign(validatedPayload, getJwtRefreshSecret(), options);
}

export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, getJwtSecret(), {
      issuer: "student-email-automation",
      audience: "user",
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw new Error("Token verification failed");
  }
}

export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, getJwtRefreshSecret(), {
      issuer: "student-email-automation",
      audience: "user",
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token");
    }
    throw new Error("Refresh token verification failed");
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token);

    if (typeof decoded === "string" || !decoded) {
      return null;
    }

    return decoded as JWTPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

export function getTokenExpiry(token: string): number | null {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;

    return decoded.exp * 1000 - Date.now();
  } catch {
    return null;
  }
}
