import FileSync from "lowdb/adapters/FileSync";
import low from "lowdb";
import { VoiceParam } from "./types";

const adapter = new FileSync<Record<string, Partial<ServerConfig>>>("guildSettings.json");
const serverConfDB = low(adapter);
serverConfDB.read();

export type ServerConfig = {
  commandPrefix: string;
  defaultSpeakerParam: VoiceParam;
  // connectCommand: string,
  // disconnectCommand: string,
};

const defaultConfig: ServerConfig = {
  commandPrefix: process.env.COMMAND_PREFIX || "yosuga",
  defaultSpeakerParam: {
    intonation: 1,
    pitch: 1,
  },
};

export const getGuildConfig = (guildId: string): ServerConfig => {
  if (!serverConfDB.has(guildId).value()) {
    void serverConfDB.set(guildId, {}).write();
  }
  return {
    ...defaultConfig,
    ...serverConfDB.get(guildId).value(),
  };
};
