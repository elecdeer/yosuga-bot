-- CreateTable
CREATE TABLE "UserConfig"
(
    "snowflake"  TEXT NOT NULL PRIMARY KEY,
    "class"      TEXT NOT NULL,
    "voiceId"    INTEGER,
    "pitch"      REAL,
    "intonation" REAL,
    CONSTRAINT "UserConfig_voiceId_fkey" FOREIGN KEY ("voiceId") REFERENCES "Voice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildConfig"
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

-- CreateTable
CREATE TABLE "Voice"
(
    "id"     INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name"   TEXT    NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type"   TEXT    NOT NULL,
    "params" TEXT    NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserConfig_voiceId_key" ON "UserConfig" ("voiceId");

-- CreateIndex
CREATE INDEX "UserConfig_snowflake_idx" ON "UserConfig" ("snowflake");

-- CreateIndex
CREATE INDEX "GuildConfig_snowflake_idx" ON "GuildConfig" ("snowflake");

-- CreateIndex
CREATE UNIQUE INDEX "Voice_name_key" ON "Voice" ("name");
