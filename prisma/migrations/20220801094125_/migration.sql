/*
  Warnings:

  - You are about to drop the `VoiceroidDaemonVoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VoicevoxVoice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `params` to the `Voice` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "VoiceroidDaemonVoice_voiceId_key";

-- DropIndex
DROP INDEX "VoicevoxVoice_voiceId_key";

-- DropTable
PRAGMA
foreign_keys=off;
DROP TABLE "VoiceroidDaemonVoice";
PRAGMA
foreign_keys=on;

-- DropTable
PRAGMA
foreign_keys=off;
DROP TABLE "VoicevoxVoice";
PRAGMA
foreign_keys=on;

-- RedefineTables
PRAGMA
foreign_keys=OFF;
CREATE TABLE "new_Voice"
(
    "id"     INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name"   TEXT    NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type"   TEXT    NOT NULL,
    "params" TEXT    NOT NULL
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
