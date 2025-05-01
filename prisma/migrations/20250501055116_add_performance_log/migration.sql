-- CreateTable
CREATE TABLE "PerformanceLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "question" TEXT,
    "documentIds" TEXT[],
    "embeddingTime" DOUBLE PRECISION,
    "vectorSearchTime" DOUBLE PRECISION,
    "llmCompletionTime" DOUBLE PRECISION,
    "docProcessingTime" DOUBLE PRECISION,
    "totalTime" DOUBLE PRECISION NOT NULL,
    "llmTimingBreakdown" JSONB,
    "docTimingBreakdown" JSONB,
    "docMetricsJson" JSONB,

    CONSTRAINT "PerformanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PerformanceLog_userId_idx" ON "PerformanceLog"("userId");

-- CreateIndex
CREATE INDEX "PerformanceLog_timestamp_idx" ON "PerformanceLog"("timestamp");

-- AddForeignKey
ALTER TABLE "PerformanceLog" ADD CONSTRAINT "PerformanceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
