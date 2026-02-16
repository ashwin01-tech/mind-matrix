-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastInteraction" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "personalityTraits" TEXT NOT NULL DEFAULT '{}',
    "speakingStyle" TEXT NOT NULL DEFAULT '{}',
    "preferences" TEXT NOT NULL DEFAULT '{}',
    "emotionalBaseline" TEXT NOT NULL DEFAULT 'neutral'
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "sessionId" INTEGER,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "emotion" TEXT,
    "emotionIntensity" REAL NOT NULL DEFAULT 0.5,
    "sentimentScore" REAL NOT NULL DEFAULT 0.0,
    "confidence" REAL,
    "method" TEXT,
    "valence" TEXT,
    "arousal" TEXT,
    "triggers" TEXT,
    "cognitive_distortions" TEXT,
    "secondary_emotions" TEXT,
    "psychological_state" TEXT,
    "therapy_mode" TEXT,
    "therapy_technique" TEXT,
    "exercise" TEXT,
    "crisis_detected" BOOLEAN NOT NULL DEFAULT false,
    "crisis_severity" TEXT,
    "safety_plan_offered" BOOLEAN NOT NULL DEFAULT false,
    "crisis_resources" TEXT,
    "audioPath" TEXT,
    "audioDuration" REAL,
    "voiceExpression" TEXT,
    "contextWindow" INTEGER NOT NULL DEFAULT 0,
    "relevanceScore" REAL NOT NULL DEFAULT 1.0,
    CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conversations_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "chat_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "emotion_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emotion" TEXT NOT NULL,
    "intensity" REAL NOT NULL DEFAULT 0.5,
    "trigger" TEXT,
    "conversationId" INTEGER,
    "emotionTrend" TEXT NOT NULL DEFAULT 'stable',
    "durationEstimate" INTEGER,
    CONSTRAINT "emotion_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "emotion_logs_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activityType" TEXT NOT NULL,
    "activityCategory" TEXT,
    "description" TEXT,
    "activityData" TEXT NOT NULL DEFAULT '{}',
    "duration" REAL,
    "emotionalContext" TEXT,
    CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conversation_embeddings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "conversationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "embeddingVector" TEXT NOT NULL,
    "embeddingDimension" INTEGER NOT NULL DEFAULT 384,
    "chunkIndex" INTEGER NOT NULL DEFAULT 0,
    "relevanceTags" TEXT NOT NULL DEFAULT '[]',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversation_embeddings_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conversation_embeddings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "chat_sessions_userId_idx" ON "chat_sessions"("userId");

-- CreateIndex
CREATE INDEX "conversations_userId_idx" ON "conversations"("userId");

-- CreateIndex
CREATE INDEX "conversations_sessionId_idx" ON "conversations"("sessionId");

-- CreateIndex
CREATE INDEX "conversations_timestamp_idx" ON "conversations"("timestamp");

-- CreateIndex
CREATE INDEX "conversations_crisis_detected_idx" ON "conversations"("crisis_detected");

-- CreateIndex
CREATE INDEX "conversations_therapy_mode_idx" ON "conversations"("therapy_mode");

-- CreateIndex
CREATE INDEX "emotion_logs_userId_idx" ON "emotion_logs"("userId");

-- CreateIndex
CREATE INDEX "emotion_logs_timestamp_idx" ON "emotion_logs"("timestamp");

-- CreateIndex
CREATE INDEX "emotion_logs_emotion_idx" ON "emotion_logs"("emotion");

-- CreateIndex
CREATE INDEX "user_activities_userId_idx" ON "user_activities"("userId");

-- CreateIndex
CREATE INDEX "user_activities_timestamp_idx" ON "user_activities"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_embeddings_conversationId_key" ON "conversation_embeddings"("conversationId");

-- CreateIndex
CREATE INDEX "conversation_embeddings_userId_idx" ON "conversation_embeddings"("userId");
