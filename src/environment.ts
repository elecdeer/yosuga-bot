import { config } from "dotenv";
import { getLogger } from "log4js";

config();

const logger = getLogger("environment");

export type YosugaEnv = {
  guildConfigPath: string;
  userConfigPath: string;
  discordToken: string;
  voiceroidDaemonUrl?: string;
  assistantSeikaUrl?: string;
  assistantSeikaBasicUser?: string;
  assistantSeikaBasicPassword?: string;
  socketIOAudioRecorderWSUrl: string;
};

const initEnv = (): YosugaEnv => {
  logger.info("initEnv");
  const env: Partial<YosugaEnv> = {
    guildConfigPath: process.env.GUILD_CONFIG_PATH,
    userConfigPath: process.env.USER_CONFIG_PATH,
    discordToken: process.env.DISCORD_TOKEN,
    voiceroidDaemonUrl: process.env.VOICEROID_DAEMON_URL,
    assistantSeikaUrl: process.env.ASSISTANT_SEIKA_URL,
    assistantSeikaBasicUser: process.env.ASSISTANT_SEIKA_BASIC_USER,
    assistantSeikaBasicPassword: process.env.ASSISTANT_SEIKA_BASIC_PASSWORD,
    socketIOAudioRecorderWSUrl: process.env.SOCKERIO_AUDIO_RECORDER_WS_URL,
  };

  if (!env.guildConfigPath) env.guildConfigPath = "guildConfig.json";
  if (!env.userConfigPath) env.userConfigPath = "userConfig.json";
  if (!env.discordToken) throw Error("環境変数 DISCORD_TOKEN が設定されていません");
  if (!env.voiceroidDaemonUrl) {
    logger.warn(
      "環境変数 VOICEROID_DAEMON_URL が設定されていないためvoiceroidDaemonによる読み上げができません"
    );
  }
  if (!env.assistantSeikaUrl) {
    logger.warn(
      "環境変数 ASSISTANT_SEIKA_URL が設定されていないためassistantSeikaによる読み上げができません"
    );
  }
  if (!env.assistantSeikaBasicUser) {
    logger.warn(
      "環境変数 ASSISTANT_SEIKA_BASIC_USER が設定されていないためassistantSeikaによる読み上げができません"
    );
  }
  if (!env.assistantSeikaBasicPassword) {
    logger.warn(
      "環境変数 ASSISTANT_SEIKA_BASIC_PASSWORD が設定されていないためassistantSeikaによる読み上げができません"
    );
  }
  if (!env.socketIOAudioRecorderWSUrl) {
    logger.warn(
      "環境変数 SOCKERIO_AUDIO_RECORDER_WS_URL が設定されていないためassistantSeikaによる読み上げができません"
    );
    env.socketIOAudioRecorderWSUrl = "";
  }

  logger.info(env);

  return env as YosugaEnv;
};

export const yosugaEnv: Readonly<YosugaEnv> = initEnv();
