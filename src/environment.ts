import { config } from "dotenv";
import * as fs from "fs";

config();

export type YosugaEnv = {
  configPath: string;
  discordToken: string;
  discordAppId: string;
  discordPublicKey: string;
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
  };

  if (!env.configPath) env.configPath = "./config";
  if (!env.discordToken) throw Error("環境変数 DISCORD_TOKEN が設定されていません");

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
