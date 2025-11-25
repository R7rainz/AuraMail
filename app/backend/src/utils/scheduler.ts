import cron from "node-cron";
import path from "path";
import { google } from "googleapis";
import { fetchPlacementMails } from "./gmailParser";
import { prisma } from "database";
import fs from "fs";

//helper function to refresh expired token
async function refreshToken(
  userId: string,
  refreshTokenStr: string,
): Promise<string | null> {
  try {
    const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    const { client_secret, client_id, redirect_urls } =
      credentials.web || credentials.installed;

    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_urls[0],
    );

    oAuth2Client.setCredentials({
      refresh_token: refreshTokenStr,
    });

    const refreshResponse = await oAuth2Client.refreshAccessToken();
    const newTokens = refreshResponse.credentials;

    const accessToken = newTokens.access_token;

    if (!accessToken) {
      throw new Error("No access token returned during refresh");
    }

    await prisma.gmailToken.update({
      where: { userId },
      data: {
        accessToken,
        expiryDate: newTokens.expiry_date
          ? new Date(newTokens.expiry_date)
          : null,
      },
    });
    return accessToken;
  } catch (error) {
    console.error(`Failed to refresh token for user ${userId}: `, error);
    return null;
  }
}

//schedule job to sync emails for all users with valid refresh token
export function startEmailSyncScheduler(
  cronExpression: string = "0 */6 * * * *",
) {
  console.log(`Email sync schedule startEmailSyncScheduler`);

  cron.schedule(cronExpression, async () => {
    console.log(`Starting schedule email sync for all users...`);
    try {
      const users = await prisma.user.findMany({
        where: {
          gmailTokens: {
            some: {
              refreshToken: {
                not: null,
              },
            },
          },
        },
        include: {
          gmailTokens: true,
        },
      });

      console.log(`Found ${users.length} users with Gmail tokens.`);

      for (const user of users) {
        try {
          const token = user.gmailTokens[0];
          if (!token) continue;

          console.log(`Syncing emails for user ${user.id}...`);
          let accessToken = token.accessToken;
          const now = new Date();
          const isExpired = token.expiryDate && token.expiryDate < now;

          if (isExpired) {
            console.log(`Token expired, refreshing...`);

            if (!token.refreshToken) {
              console.warn(`No refresh token for user ${user.id}, skipping.`);
              continue;
            }

            const newAccessToken = await refreshToken(
              user.id,
              token.refreshToken,
            );

            if (!newAccessToken) {
              console.error(
                `Failed to refresh token for user ${user.id}, skipping.`,
              );
              continue;
            }

            accessToken = newAccessToken;
            console.log(`Token refreshed successfully`);
          }

          const result = await fetchPlacementMails(user.id, accessToken);

          console.log(`✓ Sync completed for ${user.email}:`);
          console.log(`  ├─ Saved: ${result.saved}`);
          console.log(`  ├─ Skipped: ${result.skipped}`);
          console.log(`  └─ Errors: ${result.errors}`);

          await new Promise((resolve) => setTimeout(resolve, 2000)); //2 sec delay between users
        } catch (userError) {
          console.error(
            `Failed to sync emails for user ${user.id}: `,
            userError,
          );
        }
      }
      console.log(`\n Scheduled email sync completed \n`);
    } catch (error) {
      console.error(`Error in scheduled email sync: `, error);
    }
  });

  return {
    stop: () => cron.getTasks().forEach((task: any) => task.stop()),
    triggerNow: async () => {
      console.log(`Manually triggering email sync...`);
    },
  };
}

//scheduled job to clean up old emails
//runs once a week
export function startEmailCleanupScheduler(
  cronExpression: string = "0 0 * * 0",
) {
  console.log(`Email cleanup scheduler started (cron: ${cronExpression})`);

  cron.schedule(cronExpression, async () => {
    console.log(`Starting scheduled email cleanup...`);

    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      //delete old emails older than 6 months
      const result = await prisma.email.deleteMany({
        where: {
          createdAt: {
            lt: sixMonthsAgo,
          },
          isImportant: false, //this wont let important emails be deleted
        },
      });

      console.log(`Cleaned up ${result.count} old emails.`);
    } catch (error) {
      console.error(`Error in scheduled email cleanup: `, error);
    }
  });
}
