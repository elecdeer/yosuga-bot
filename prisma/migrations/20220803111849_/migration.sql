/*
  Warnings:

  - You are about to drop the `GeneralConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PersonalConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA
foreign_keys=off;
DROP TABLE "GeneralConfig";
PRAGMA
foreign_keys=on;

-- DropTable
PRAGMA
foreign_keys=off;
DROP TABLE "PersonalConfig";
PRAGMA
foreign_keys=on;

-- CreateTable
CREATE TABLE "Personal"
(
    "snowflake"  TEXT NOT NULL PRIMARY KEY,
    "class"      TEXT NOT NULL,
    "voiceId"    INTEGER,
    "pitch"      REAL,
    "intonation" REAL,
    CONSTRAINT "Personal_voiceId_fkey" FOREIGN KEY ("voiceId") REFERENCES "Voice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "General"
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
CREATE INDEX "Personal_snowflake_idx" ON "Personal" ("snowflake");

-- CreateIndex
CREATE INDEX "General_snowflake_idx" ON "General" ("snowflake");
