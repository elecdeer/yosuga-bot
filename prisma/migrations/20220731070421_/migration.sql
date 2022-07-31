/*
  Warnings:

  - The primary key for the `GuildConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA
foreign_keys=OFF;
CREATE TABLE "new_GuildConfig"
(
    "id"             TEXT    NOT NULL PRIMARY KEY,
    "volume"         REAL    NOT NULL DEFAULT 1.0,
    "speed"          REAL    NOT NULL DEFAULT 1.2,
    "fastSpeedScale" REAL    NOT NULL DEFAULT 1.5,
    "readEnterExit"  BOOLEAN NOT NULL DEFAULT true,
    "readTimeSignal" BOOLEAN NOT NULL DEFAULT true,
    "timeAutoLeave"  INTEGER NOT NULL DEFAULT 10000,
    "timeReReadName" INTEGER NOT NULL DEFAULT 30000,
    "readMaxLength"  INTEGER NOT NULL DEFAULT 80
);
INSERT INTO "new_GuildConfig" ("fastSpeedScale", "id", "readEnterExit", "readMaxLength", "readTimeSignal", "speed",
                               "timeAutoLeave", "timeReReadName", "volume")
SELECT "fastSpeedScale",
       "id",
       "readEnterExit",
       "readMaxLength",
       "readTimeSignal",
       "speed",
       "timeAutoLeave",
       "timeReReadName",
       "volume"
FROM "GuildConfig";
DROP TABLE "GuildConfig";
ALTER TABLE "new_GuildConfig" RENAME TO "GuildConfig";
CREATE TABLE "new_UserConfig"
(
    "id"         TEXT    NOT NULL PRIMARY KEY,
    "voiceId"    INTEGER NOT NULL,
    "pitch"      REAL    NOT NULL DEFAULT 1.0,
    "intonation" REAL    NOT NULL DEFAULT 1.0,
    CONSTRAINT "UserConfig_voiceId_fkey" FOREIGN KEY ("voiceId") REFERENCES "Voice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserConfig" ("id", "intonation", "pitch", "voiceId")
SELECT "id", "intonation", "pitch", "voiceId"
FROM "UserConfig";
DROP TABLE "UserConfig";
ALTER TABLE "new_UserConfig" RENAME TO "UserConfig";
CREATE UNIQUE INDEX "UserConfig_voiceId_key" ON "UserConfig" ("voiceId");
PRAGMA
foreign_key_check;
PRAGMA
foreign_keys=ON;
