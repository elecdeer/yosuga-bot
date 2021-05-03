import FileSync from "lowdb/adapters/FileSync";
import low from "lowdb";
import { GuildConfig, UserConfig, VoiceParam } from "./types";
import { yosugaEnv } from "./environment";
import { SpeakerMap } from "./speaker/speakersBuilder";
import { getLogger } from "log4js";

type GuildConfigRecord = Record<string, Partial<GuildConfig>> & { default: GuildConfig };
type UserConfigRecord = Record<string, Partial<UserConfig>>;

const logger = getLogger("configManager");

const guildConfigInitialDefault: GuildConfig = {
  commandPrefix: "yosuga",
  voiceParam: {
    intonation: 1,
    pitch: 1,
    speakerOption: {
      speaker: "voiceroid",
    },
  },
  pauseParam: {
    shortPause: 150,
    longPause: 370,
    sentencePause: 800,
  },
  wordDictionary: [],
  masterVolume: 1,
  masterSpeed: 1.1,
  fastSpeedScale: 1.5,
  readStatusUpdate: true,
  readTimeSignal: false,
  timeToAutoLeaveSec: 10,
  timeToReadMemberNameSec: 30,
  ignorePrefix: "!!",
  maxStringLength: 80,
};

const guildAdapter = new FileSync<GuildConfigRecord>(yosugaEnv.guildConfigPath);
const guildConfigData = low(guildAdapter);
void guildConfigData
  .defaults({
    default: guildConfigInitialDefault,
  })
  .write();
guildConfigData.read();

const userAdapter = new FileSync<UserConfigRecord>(yosugaEnv.userConfigPath);
const userConfigData = low(userAdapter);
userConfigData.read();

export type GuildConfigWithoutVoice = Omit<GuildConfig, "voiceParam">;

/**
 * guildIdから各guildの設定を取得
 * @param guildId
 */
export const getGuildConfig = (guildId: string): Readonly<GuildConfigWithoutVoice> => {
  return {
    ...guildConfigInitialDefault,
    ...guildConfigData.get("default").value(),
    ...guildConfigData.get(guildId).value(),
  };
};

/**
 * guildIdとuserId、speakerMapから利用可能な読み上げ設定を取得
 * mergeは行わない
 * @param speakerMap
 * @param guildId
 * @param userId
 */
export const getVoiceConfig = (
  speakerMap: SpeakerMap,
  guildId: string,
  userId?: string
): Readonly<VoiceParam> | null => {
  if (userId) {
    const userConfig = userConfigData.get(userId).value()?.voiceParam;
    logger.debug("user", userConfigData.get(userId).value());
    if (userConfig && speakerMap[userConfig.speakerOption.speaker].status === "active") {
      return userConfig;
    }
  }

  const guildConfig = guildConfigData.get(guildId).value()?.voiceParam;
  logger.debug("guild", guildConfigData.get(guildId).value());

  if (guildConfig && speakerMap[guildConfig.speakerOption.speaker].status === "active") {
    return guildConfig;
  }

  const defaultConfig = guildConfigData.get("default").value()?.voiceParam;
  logger.debug("defalut", guildConfigData.get("default").value());

  if (defaultConfig && speakerMap[defaultConfig.speakerOption.speaker].status === "active") {
    return defaultConfig;
  }

  return null;
};
