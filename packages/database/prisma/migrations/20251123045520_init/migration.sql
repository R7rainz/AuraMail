-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "provider" TEXT NOT NULL,
    "providerId" TEXT,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gmail_tokens" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "scope" TEXT,
    "tokenType" TEXT DEFAULT 'Bearer',
    "expiryDate" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gmail_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "subject" TEXT,
    "from" TEXT,
    "date" TEXT,
    "snippet" TEXT NOT NULL,
    "body" TEXT,
    "summary" TEXT,
    "category" TEXT,
    "deadline" TEXT,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "company" TEXT,
    "role" TEXT,
    "applyLink" TEXT,
    "eligibility" TEXT,
    "timings" TEXT,
    "salary" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_mails" (
    "id" SERIAL NOT NULL,
    "gmailMessageId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "snippet" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "eligibility" TEXT,
    "deadline" TIMESTAMP(3),
    "applyLink" TEXT,
    "otherLinks" TEXT,
    "attachments" TEXT,
    "summary" TEXT,
    "category" TEXT,
    "timings" TEXT,
    "salary" TEXT,
    "location" TEXT,
    "eventDetails" TEXT,
    "requirements" TEXT,
    "description" TEXT,
    "attachmentSummary" TEXT,
    "rawAiOutput" TEXT,
    "hasAnomaly" BOOLEAN NOT NULL DEFAULT false,
    "anomalies" TEXT,
    "anomalySeverity" TEXT,
    "requiresReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "markedImportant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "placement_mails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "gmail_tokens_userId_key" ON "gmail_tokens"("userId");

-- CreateIndex
CREATE INDEX "emails_userId_idx" ON "emails"("userId");

-- CreateIndex
CREATE INDEX "emails_category_idx" ON "emails"("category");

-- CreateIndex
CREATE INDEX "emails_isImportant_idx" ON "emails"("isImportant");

-- CreateIndex
CREATE UNIQUE INDEX "emails_id_userId_key" ON "emails"("id", "userId");

-- CreateIndex
CREATE INDEX "placement_mails_gmailMessageId_idx" ON "placement_mails"("gmailMessageId");

-- CreateIndex
CREATE INDEX "placement_mails_receivedAt_idx" ON "placement_mails"("receivedAt");

-- CreateIndex
CREATE INDEX "placement_mails_deadline_idx" ON "placement_mails"("deadline");

-- CreateIndex
CREATE INDEX "placement_mails_markedImportant_idx" ON "placement_mails"("markedImportant");

-- CreateIndex
CREATE INDEX "placement_mails_userId_idx" ON "placement_mails"("userId");

-- CreateIndex
CREATE INDEX "placement_mails_company_idx" ON "placement_mails"("company");

-- CreateIndex
CREATE INDEX "placement_mails_category_idx" ON "placement_mails"("category");

-- CreateIndex
CREATE INDEX "placement_mails_requiresReview_idx" ON "placement_mails"("requiresReview");

-- CreateIndex
CREATE INDEX "placement_mails_hasAnomaly_idx" ON "placement_mails"("hasAnomaly");

-- CreateIndex
CREATE UNIQUE INDEX "placement_mails_gmailMessageId_userId_key" ON "placement_mails"("gmailMessageId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "gmail_tokens" ADD CONSTRAINT "gmail_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_mails" ADD CONSTRAINT "placement_mails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
