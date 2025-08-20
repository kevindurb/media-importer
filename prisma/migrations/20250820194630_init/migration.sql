-- CreateTable
CREATE TABLE "ImportFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "tmdbMatchId" INTEGER,
    "isTVShow" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "ImportFile_path_key" ON "ImportFile"("path");
