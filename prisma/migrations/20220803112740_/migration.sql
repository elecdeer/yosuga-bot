/*
  Warnings:

  - You are about to drop the column `class` on the `General` table. All the data in the column will be lost.
  - You are about to drop the column `class` on the `Personal` table. All the data in the column will be lost.
  - Added the required column `level` to the `General` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `Personal` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA
foreign_keys=OFF;
CREATE TABLE "new_General"
(
    "snowflake"      TEXT NOT NULL PRIMARY KEY,
    "level"          TEXT NOT NULL,
    "volume"         REAL,
    "speed"          REAL,
    "fastSpeedScale" REAL,
    "readEnterExit"  BOOLEAN,
    "readTimeSignal" BOOLEAN,
    "timeAutoLeave"  INTEGER,
    "timeReReadName" INTEGER,
    "readMaxLength"  INTEGER
);
INSERT INTO "new_General" ("fastSpeedScale", "readEnterExit", "readMaxLength", "readTimeSignal", "snowflake", "speed",
                           "timeAutoLeave", "timeReReadName", "volume")
SELECT "fastSpeedScale",
       "readEnterExit",
       "readMaxLength",
       "readTimeSignal",
       "snowflake",
       "speed",
       "timeAutoLeave",
       "timeReReadName",
       "volume"
FROM "General";
DROP TABLE "General";
ALTER TABLE "new_General" RENAME TO "General";
CREATE INDEX "General_snowflake_idx" ON "General" ("snowflake");
CREATE TABLE "new_Personal"
(
    "snowflake"  TEXT NOT NULL PRIMARY KEY,
    "level"      TEXT NOT NULL,
    "voiceId"    INTEGER,
    "pitch"      REAL,
    "intonation" REAL,
    CONSTRAINT "Personal_voiceId_fkey" FOREIGN KEY ("voiceId") REFERENCES "Voice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Personal" ("intonation", "pitch", "snowflake", "voiceId")
SELECT "intonation", "pitch", "snowflake", "voiceId"
FROM "Personal";
DROP TABLE "Personal";
ALTER TABLE "new_Personal" RENAME TO "Personal";
CREATE INDEX "Personal_snowflake_idx" ON "Personal" ("snowflake");
PRAGMA
foreign_key_check;
PRAGMA
foreign_keys=ON;
