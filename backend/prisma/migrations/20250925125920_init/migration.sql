-- CreateTable
CREATE TABLE "avatars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL DEFAULT '0.0.1',
    "filePath" TEXT NOT NULL,
    "primaryColor" TEXT,
    "foreignColor" TEXT,
    "colorScheme" TEXT,
    "seed" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "avatars_filePath_key" ON "avatars"("filePath");
