-- RedefineTables
PRAGMA
foreign_keys=OFF;
CREATE TABLE "new_GuildConfig"
(
    "id"             TEXT NOT NULL PRIMARY KEY,
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
CREATE TABLE "new_UserConfig"
(
    "id"         TEXT NOT NULL PRIMARY KEY,
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
CREATE UNIQUE INDEX "UserConfig_voiceId_key" ON "UserConfig" ("voiceId");
PRAGMA
foreign_key_check;
PRAGMA
foreign_keys=ON;
