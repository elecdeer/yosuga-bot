import { config } from "dotenv";
import { readFileSync } from "fs";
import { z } from "zod";

import type { JsonObject } from "type-fest";

config();

const yosugaEnvScheme = z.object({
  nodeEnv: z.union([z.literal("production"), z.literal("development")]).default("production"),
  logDir: z.string().default("./log"),
  configDir: z.string().default("./config"),
  discordToken: z.string(),
});

export type YosugaEnv = z.infer<typeof yosugaEnvScheme>;

const imageEnvScheme = z.object({
  commitId: z.string().default(""),
  ref: z.string().default(""),
  imageName: z.string().default(""),
  trigger: z.string().default(""),
});

export type ImageEnv = z.infer<typeof imageEnvScheme>;

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

const readImageEnvFile = (): JsonObject => {
  try {
    return JSON.parse(readFileSync("./imageenv.json").toString());
  } catch (e) {
    return {};
  }
};

const initImageEnv = (): ImageEnv => {
  const readResult = readImageEnvFile();
  return imageEnvScheme.parse(readResult);
};
export const imageEnv: Readonly<ImageEnv> = initImageEnv();
