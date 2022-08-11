/*
  Warnings:

  - You are about to drop the `GuildConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA
foreign_keys=off;
DROP TABLE "GuildConfig";
PRAGMA
foreign_keys=on;

-- DropTable
PRAGMA
foreign_keys=off;
DROP TABLE "UserConfig";
PRAGMA
foreign_keys=on;

-- CreateTable
CREATE TABLE "PersonalConfig"
(
    "snowflake"  TEXT NOT NULL PRIMARY KEY,
    "class"      TEXT NOT NULL,
    "voiceId"    INTEGER,
    "pitch"      REAL,
    "intonation" REAL,
    CONSTRAINT "PersonalConfig_voiceId_fkey" FOREIGN KEY ("voiceId") REFERENCES "Voice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeneralConfig"
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

-- CreateIndex
CREATE UNIQUE INDEX "PersonalConfig_voiceId_key" ON "PersonalConfig" ("voiceId");

-- CreateIndex
CREATE INDEX "PersonalConfig_snowflake_idx" ON "PersonalConfig" ("snowflake");

-- CreateIndex
CREATE INDEX "GeneralConfig_snowflake_idx" ON "GeneralConfig" ("snowflake");
