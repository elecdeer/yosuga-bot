import { config } from "dotenv";
import * as fs from "fs";

config();

export type YosugaEnv = {
  configPath: string;
  discordToken: string;
  discordAppId: string;
  discordPublicKey: string;
  voiceroidDaemonUrl?: string;
  assistantSeikaUrl?: string;
  assistantSeikaBasicUser?: string;
  assistantSeikaBasicPassword?: string;
  socketIOAudioRecorderWSUrl: string;
};

export type ImageEnv = {
  commitId: string;
  ref: string;
  imageName: string;
  trigger: string;
};

const initEnv = (): YosugaEnv => {
  console.log("initEnv");
  const env: Partial<YosugaEnv> = {
    configPath: process.env.CONFIG_PATH,
    discordToken: process.env.DISCORD_TOKEN,
    discordAppId: process.env.DISCORD_APP_ID,
    discordPublicKey: process.env.DISCORD_PUB_KEY,
    voiceroidDaemonUrl: process.env.VOICEROID_DAEMON_URL,
    assistantSeikaUrl: process.env.ASSISTANT_SEIKA_URL,
    assistantSeikaBasicUser: process.env.ASSISTANT_SEIKA_BASIC_USER,
    assistantSeikaBasicPassword: process.env.ASSISTANT_SEIKA_BASIC_PASSWORD,
    socketIOAudioRecorderWSUrl: process.env.SOCKETIO_AUDIO_RECORDER_WS_URL,
  };

  if (!env.configPath) env.configPath = "./config";
  if (!env.discordToken) throw Error("環境変数 DISCORD_TOKEN が設定されていません");
  if (!env.voiceroidDaemonUrl) {
    console.warn(
      "環境変数 VOICEROID_DAEMON_URL が設定されていないためvoiceroidDaemonによる読み上げができません"
    );
  }
  if (!env.assistantSeikaUrl) {
    console.warn(
      "環境変数 ASSISTANT_SEIKA_URL が設定されていないためassistantSeikaによる読み上げができません"
    );
  }
  if (!env.assistantSeikaBasicUser) {
    console.warn(
      "環境変数 ASSISTANT_SEIKA_BASIC_USER が設定されていないためassistantSeikaによる読み上げができません"
    );
  }
  if (!env.assistantSeikaBasicPassword) {
    console.warn(
      "環境変数 ASSISTANT_SEIKA_BASIC_PASSWORD が設定されていないためassistantSeikaによる読み上げができません"
    );
  }
  if (!env.socketIOAudioRecorderWSUrl) {
    console.warn(
      "環境変数 SOCKERIO_AUDIO_RECORDER_WS_URL が設定されていないためassistantSeikaによる読み上げができません"
    );
    env.socketIOAudioRecorderWSUrl = "";
  }

  console.info(env);

  return env as YosugaEnv;
};

export const yosugaEnv: Readonly<YosugaEnv> = initEnv();

const initImageEnv = (): ImageEnv => {
  try {
    const readResult = fs.readFileSync("./imageenv.json");
    const env = JSON.parse(readResult.toString()) as ImageEnv;
    const empty = {
      imageName: "",
      ref: "",
      trigger: "",
      commitId: "",
    };
    return {
      ...empty,
      ...env,
    };
  } catch (e) {
    return {
      commitId: "",
      ref: "",
      imageName: "",
      trigger: "",
    };
  }
};
export const imageEnv: Readonly<ImageEnv> = initImageEnv();
