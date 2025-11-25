import express from "express";
import { getGoogleAuthURL, handleGoogleCallBack } from "../auth/google";
import {
  googleCallbackSchema,
  refreshTokenSchema,
} from "../schemas/auth.schema";
import { validateBody, validateQuery } from "../middleware/validate";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { prisma } from "database";
import { signAccessToken, verifyRefreshToken } from "../utils/jwt";

const router = express.Router();

router.get("/google", (req, res) => {
  try {
    const authUrl = getGoogleAuthURL();
    res.json({
      success: true,
      authUrl,
      message: "Visit this URL to authenticate with Google",
    });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate authenticate URL",
    });
  }
});

//Google OAuth callback
router.get(
  "/google/callback",
  validateQuery(googleCallbackSchema),
  async (req, res) => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== "string") {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        return res.redirect(`${frontendUrl}/auth?error=no_code`);
      }

      const result = await handleGoogleCallBack(code);
      if (!result) {
        throw new Error("Invalid Google callback result");
      }

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const params = new URLSearchParams({
        access_token: result.tokens.accessToken,
        refresh_token: result.tokens.refreshToken,
      });

      res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
    } catch (error) {
      console.error("OAuth callback error: ", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/auth?error=auth_failed`);
    }
  },
);

//get current user
router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error: ", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user",
    });
  }
});

//Refresh token
router.post("/refresh", validateBody(refreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        refreshToken: true,
      },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        error: "Invalid refresh token",
      });
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
    });

    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("Refresh token error: ", error);
    res.status(401).json({
      success: false,
      error: "Invalid refresh token",
    });
  }
});

router.post("/logout", authenticateToken, async (req: AuthRequest, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { refreshToken: null },
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to logout",
    });
  }
});

export default router;
