import FileSync from "lowdb/adapters/FileSync";
import low from "lowdb";
import { SpeakerParam } from "./speaker/speaker";

const adapter = new FileSync<Record<string, Partial<ServerConfig>>>(
  "guildSettings.json"
);
const serverConfDB = low(adapter);
serverConfDB.read();

export type ServerConfig = {
  commandPrefix: string;
  defaultSpeakerParam: SpeakerParam;
  // connectCommand: string,
  // disconnectCommand: string,
};

const defaultConfig: ServerConfig = {
  commandPrefix: process.env.COMMAND_PREFIX || "yosuga",
  defaultSpeakerParam: {
    Speed: 1.2,
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
