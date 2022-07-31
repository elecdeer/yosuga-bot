/*
  Warnings:

  - A unique constraint covering the columns `[voiceId]` on the table `UserConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA
foreign_keys=OFF;
CREATE TABLE "new_Voice"
(
    "id"     INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name"   TEXT    NOT NULL,
    "type"   TEXT    NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Voice" ("active", "id", "name", "type")
SELECT "active", "id", "name", "type"
FROM "Voice";
DROP TABLE "Voice";
ALTER TABLE "new_Voice" RENAME TO "Voice";
CREATE UNIQUE INDEX "Voice_name_key" ON "Voice" ("name");
PRAGMA
foreign_key_check;
PRAGMA
foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "UserConfig_voiceId_key" ON "UserConfig" ("voiceId");
