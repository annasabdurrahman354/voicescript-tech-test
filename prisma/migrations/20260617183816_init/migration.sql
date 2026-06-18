-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseName" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "locationType" TEXT NOT NULL,
    "city" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "reporterId" TEXT,
    "editorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Job_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "Reporter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Job_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "Editor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reporter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "ratePerMinute" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Editor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "flatFee" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "reporterPayout" INTEGER NOT NULL,
    "editorPayout" INTEGER NOT NULL,
    "totalPayout" INTEGER NOT NULL,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_jobId_key" ON "Payment"("jobId");
