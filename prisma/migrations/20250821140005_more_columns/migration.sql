-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ImportFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "tmdbMatchId" INTEGER,
    "isTVShow" BOOLEAN NOT NULL DEFAULT false,
    "season" INTEGER,
    "episode" INTEGER,
    "year" INTEGER,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ImportFile" ("id", "isTVShow", "path", "tmdbMatchId") SELECT "id", "isTVShow", "path", "tmdbMatchId" FROM "ImportFile";
DROP TABLE "ImportFile";
ALTER TABLE "new_ImportFile" RENAME TO "ImportFile";
CREATE UNIQUE INDEX "ImportFile_path_key" ON "ImportFile"("path");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
