import FileSync from "lowdb/adapters/FileSync";
import low from "lowdb";
import { GuildConfig, UserConfig, VoiceOption } from "./types";
import { yosugaEnv } from "./environment";
import { getLogger } from "log4js";
import { VoiceProvider } from "./speaker/voiceProvider";

type GuildConfigRecord = Record<string, Partial<GuildConfig>> & { default: GuildConfig };
type UserConfigRecord = Record<string, Partial<UserConfig>>;

const logger = getLogger("configManager");

const guildConfigInitialDefault: GuildConfig = {
  commandPrefix: "yosuga",
  voiceOption: {
    speakerName: "yukari",
    voiceParam: {
      intonation: 1,
      pitch: 1,
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
  enableSlashCommand: false,
};

const guildAdapter = new FileSync<GuildConfigRecord>(yosugaEnv.guildConfigPath);
const guildConfigData = low(guildAdapter);
void guildConfigData
  .defaults({
    default: guildConfigInitialDefault,
  })
  .write();

const userAdapter = new FileSync<UserConfigRecord>(yosugaEnv.userConfigPath);
const userConfigData = low(userAdapter);

export type GuildConfigWithoutVoice = Omit<GuildConfig, "voiceParam">;

export const reloadConfigData = async (): Promise<void> => {
  guildConfigData.read();
  userConfigData.read();
  logger.debug(guildConfigData.toJSON());
  logger.debug(userConfigData.toJSON());
};

void reloadConfigData().catch((err) => {
  logger.error("設定ファイルの読み込みに失敗しました");
  throw err;
});

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
 * @param voiceProvider
 * @param guildId
 * @param userId
 */
export const getVoiceConfig = (
  voiceProvider: VoiceProvider,
  guildId: string,
  userId?: string
): Readonly<VoiceOption> | null => {
  logger.debug(voiceProvider.speakerCollection);
  const activeSpeakerCollection = voiceProvider.speakerCollection.filter(
    (speaker) => speaker.status == "active"
  );

  if (userId) {
    const userConfig = userConfigData.get(userId).value()?.voiceOption;
    logger.debug("user", userConfigData.get(userId).value());

    if (userConfig && activeSpeakerCollection.has(userConfig.speakerName)) {
      return userConfig;
    }
  }

  const guildConfig = guildConfigData.get(guildId).value()?.voiceOption;
  logger.debug("guild", guildConfigData.get(guildId).value());

  if (guildConfig && activeSpeakerCollection.has(guildConfig.speakerName)) {
    return guildConfig;
  }

  const defaultConfig = guildConfigData.get("default").value()?.voiceOption;
  logger.debug("default", guildConfigData.get("default").value());

  if (defaultConfig && activeSpeakerCollection.has(defaultConfig.speakerName)) {
    return defaultConfig;
  }

  return null;
};
