/*
  Warnings:

  - The primary key for the `UserConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserConfig` table. All the data in the column will be lost.
  - The primary key for the `GuildConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `GuildConfig` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA
foreign_keys=OFF;
CREATE TABLE "new_UserConfig"
(
    "snowflake"  TEXT NOT NULL PRIMARY KEY,
    "class"      TEXT NOT NULL,
    "voiceId"    INTEGER,
    "pitch"      REAL,
    "intonation" REAL,
    CONSTRAINT "UserConfig_voiceId_fkey" FOREIGN KEY ("voiceId") REFERENCES "Voice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserConfig" ("class", "intonation", "pitch", "snowflake", "voiceId")
SELECT "class", "intonation", "pitch", "snowflake", "voiceId"
FROM "UserConfig";
DROP TABLE "UserConfig";
ALTER TABLE "new_UserConfig" RENAME TO "UserConfig";
CREATE UNIQUE INDEX "UserConfig_voiceId_key" ON "UserConfig" ("voiceId");
CREATE INDEX "UserConfig_snowflake_idx" ON "UserConfig" ("snowflake");
CREATE TABLE "new_GuildConfig"
(
    "snowflake"      TEXT NOT NULL PRIMARY KEY,
    "class"          TEXT NOT NULL,
    "volume"         REAL,
    "speed"          REAL,
    "fastSpeedScale" REAL,
    "readEnterExit"  BOOLEAN,
    "readTimeSignal" BOOLEAN,
    "timeAutoLeave"  INTEGER,
    "timeReReadName" INTEGER,
    "readMaxLength"  INTEGER
);
INSERT INTO "new_GuildConfig" ("class", "fastSpeedScale", "readEnterExit", "readMaxLength", "readTimeSignal",
                               "snowflake", "speed", "timeAutoLeave", "timeReReadName", "volume")
SELECT "class",
       "fastSpeedScale",
       "readEnterExit",
       "readMaxLength",
       "readTimeSignal",
       "snowflake",
       "speed",
       "timeAutoLeave",
       "timeReReadName",
       "volume"
FROM "GuildConfig";
DROP TABLE "GuildConfig";
ALTER TABLE "new_GuildConfig" RENAME TO "GuildConfig";
CREATE INDEX "GuildConfig_snowflake_idx" ON "GuildConfig" ("snowflake");
PRAGMA
foreign_key_check;
PRAGMA
foreign_keys=ON;
