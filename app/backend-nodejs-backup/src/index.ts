import dotenv from "dotenv";
import path from "path";

// Load env from backend/.env first, then fall back to repo-level .env if present
// IMPORTANT: Load env BEFORE importing database package so DATABASE_URL is available
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Now import database after env is loaded
import express from "express";
import { prisma } from "database";
import cors from "cors";
import authRoutes from "./routes/auth";
import emailRoutes from "./routes/emails";
import { createRateLimiter } from "./utils/rateLimiter";
import {
  startEmailCleanupScheduler,
  startEmailSyncScheduler,
} from "./utils/scheduler";
import {
  handleOAuthCallback,
  listPlacementEmails,
  authorize,
} from "./utils/gmail";
import { fetchPlacementMails } from "./utils/gmailParser";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);

const activeSyncOptions = new Set<string>();

const syncRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: "Too many sync requests. Please try again in 15 minutes",
});

const emailFetchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 15 minutes
  maxRequests: 30,
  message: "Too many requests. Please slow down",
});

if (process.env.ENABLE_SCHEDULER === "true") {
  console.log("Starting email sync scheduler...");
  startEmailSyncScheduler();
  startEmailCleanupScheduler();
}

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

app.get("/", (req, res) => {
  res.json({
    message: "Gmail API server is running",
    endpoints: {
      auth: {
        google_login: "/api/auth/google",
        google_callback: "/api/auth/google/callback",
        me: "/api/auth/me",
        refresh: "/api/auth/refresh",
        logout: "/api/auth/logout",
      },
      email: {
        mails: "/api/mails",
        sync: "/api/sync-mails",
        placements: "/api/placements",
        emails: "/api/emails",
      },
    },
  });
});

const PORT = process.env.PORT || 5000;

app.get("/oauth2callback", async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) return res.status(400).send("No authorization code received");

    await handleOAuthCallback(code);

    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f0f0;">
          <div style="text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #4CAF50;">✓ Authorization Successful!</h1>
            <p>You can close this window and return to your terminal.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth callback error: ", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/mails", emailFetchRateLimiter, async (req, res) => {
  try {
    const auth = await authorize();
    const mails = await listPlacementEmails(auth, {
      maxResults: 20,
      includeBody: true,
    });

    res.json({
      success: true,
      count: mails.length,
      emails: mails,
    });
  } catch (error) {
    console.error("Error in /api/mails:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching mails",
    });
  }
});

app.post("/api/sync-mails", syncRateLimiter, async (req, res) => {
  const userId = req.body.userId || "default-user";
  const userToken = req.body.userToken || "dummy-token";

  if (activeSyncOptions.has(userId)) {
    return res.status(429).json({
      success: false,
      error: "Sync operation already in progress for this user",
    });
  }

  activeSyncOptions.add(userId);

  try {
    console.log(`Starting sync for user: ${userId}`);
    const result = await fetchPlacementMails(userId, userToken);
    res.json({
      success: true,
      message: "Emails synced successfully",
      state: result,
    });
  } catch (error) {
    console.error("Error syncing mails: ", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Error syncing emails",
    });
  } finally {
    activeSyncOptions.delete(userId);
  }
});

app.get("/api/placements", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    const [placements, total] = await Promise.all([
      prisma.placementMail.findMany({
        orderBy: { receivedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.placementMail.count(),
    ]);

    res.json({
      success: true,
      count: placements.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      placements,
    });
  } catch (error) {
    console.error("Error fetching placements: ", error);
    res.status(500).json({
      success: false,
      error: "Error fetching placements",
    });
  }
});

app.get("/api/emails", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      prisma.placementMail.findMany({
        where: {
          requiresReview: true,
          reviewedAt: null,
        },
        orderBy: [{ anomalySeverity: "desc" }, { receivedAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.placementMail.count({
        where: {
          requiresReview: true,
          reviewedAt: null,
        },
      }),
    ]);

    res.json({
      success: true,
      count: emails.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      emails,
    });
  } catch (error) {
    console.error("Error fetching review queue:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch review queue",
    });
  }
});

app.post("/api/emails/:id/review", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { reviewedBy } = req.body;

    const updated = await prisma.placementMail.update({
      where: { id },
      data: {
        reviewedAt: new Date(),
        reviewedBy: reviewedBy || "admin",
      },
    });

    res.json({
      success: true,
      message: "Email marked as reviewed",
      email: updated,
    });
  } catch (error) {
    console.error("Error marking email as reviewed: ", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark email as reviewed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Access your emails at: http://localhost:${PORT}/api/mails`);
});
