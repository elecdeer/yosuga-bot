-- CreateTable
CREATE TABLE "UserConfig"
(
    "id"         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "voiceId"    INTEGER NOT NULL,
    "pitch"      INTEGER NOT NULL,
    "intonation" INTEGER NOT NULL,
    CONSTRAINT "UserConfig_voiceId_fkey" FOREIGN KEY ("voiceId") REFERENCES "Voice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildConfig"
(
    "id"             INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "volume"         INTEGER NOT NULL,
    "speed"          INTEGER NOT NULL,
    "fastSpeedScale" INTEGER NOT NULL,
    "readEnterExit"  BOOLEAN NOT NULL,
    "readTimeSignal" BOOLEAN NOT NULL,
    "timeAutoLeave"  INTEGER NOT NULL,
    "timeReReadName" INTEGER NOT NULL,
    "readMaxLength"  INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Voice"
(
    "id"     INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name"   TEXT    NOT NULL,
    "type"   TEXT    NOT NULL,
    "active" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "VoicevoxVoice"
(
    "id"          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "voiceId"     INTEGER NOT NULL,
    "url"         TEXT    NOT NULL,
    "speakerUUID" TEXT    NOT NULL,
    "styleName"   TEXT    NOT NULL,
    CONSTRAINT "VoicevoxVoice_voiceId_fkey" FOREIGN KEY ("voiceId") REFERENCES "Voice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoiceroidDaemonVoice"
(
    "id"      INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "voiceId" INTEGER NOT NULL,
    "url"     TEXT    NOT NULL,
    CONSTRAINT "VoiceroidDaemonVoice_voiceId_fkey" FOREIGN KEY ("voiceId") REFERENCES "Voice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VoicevoxVoice_voiceId_key" ON "VoicevoxVoice" ("voiceId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceroidDaemonVoice_voiceId_key" ON "VoiceroidDaemonVoice" ("voiceId");
