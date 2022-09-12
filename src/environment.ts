import { config } from "dotenv";
import * as fs from "fs";
import { z } from "zod";

config();

const yosugaEnvScheme = z.object({
  nodeEnv: z.union([z.literal("production"), z.literal("development")]).default("production"),
  logDir: z.string().default("./log"),
  configDir: z.string().default("./config"),
  discordToken: z.string(),
});

export type YosugaEnv = z.infer<typeof yosugaEnvScheme>;

export type ImageEnv = {
  commitId: string;
  ref: string;
  imageName: string;
  trigger: string;
};

const initEnv = (): YosugaEnv => {
  console.log("initEnv");
  const env = {
    nodeEnv: process.env.NODE_ENV,
    logDir: process.env.LOG_DIR,
    configDir: process.env.CONFIG_DIR,
    discordToken: process.env.DISCORD_TOKEN,
  };

  try {
    const parsed = yosugaEnvScheme.parse(env);
    console.log("env", parsed);
    return parsed;
  } catch (e) {
    throw new Error("不適切な環境変数が設定されています", {
      cause: e,
    });
  }
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
