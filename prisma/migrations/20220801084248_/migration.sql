/*
  Warnings:

  - Added the required column `class` to the `GuildConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snowflake` to the `GuildConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `class` to the `UserConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snowflake` to the `UserConfig` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA
foreign_keys=OFF;
CREATE TABLE "new_GuildConfig"
(
    "id"             TEXT NOT NULL PRIMARY KEY,
    "snowflake"      TEXT NOT NULL,
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
CREATE UNIQUE INDEX "GuildConfig_snowflake_key" ON "GuildConfig" ("snowflake");
CREATE INDEX "GuildConfig_snowflake_idx" ON "GuildConfig" ("snowflake");
CREATE TABLE "new_UserConfig"
(
    "id"         TEXT NOT NULL PRIMARY KEY,
    "snowflake"  TEXT NOT NULL,
    "class"      TEXT NOT NULL,
    "voiceId"    INTEGER,
    "pitch"      REAL,
    "intonation" REAL,
    CONSTRAINT "UserConfig_voiceId_fkey" FOREIGN KEY ("voiceId") REFERENCES "Voice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserConfig" ("id", "intonation", "pitch", "voiceId")
SELECT "id", "intonation", "pitch", "voiceId"
FROM "UserConfig";
DROP TABLE "UserConfig";
ALTER TABLE "new_UserConfig" RENAME TO "UserConfig";
CREATE UNIQUE INDEX "UserConfig_snowflake_key" ON "UserConfig" ("snowflake");
CREATE UNIQUE INDEX "UserConfig_voiceId_key" ON "UserConfig" ("voiceId");
CREATE INDEX "UserConfig_snowflake_idx" ON "UserConfig" ("snowflake");
PRAGMA
foreign_key_check;
PRAGMA
foreign_keys=ON;
