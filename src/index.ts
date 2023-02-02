import { generateDependencyReport } from "@discordjs/voice";
import Discord, { Intents } from "discord.js";
import log4js from "log4js";

import { yosugaEnv } from "./environment";
import { YosugaClient } from "./yosugaClient";

import type { Client } from "discord.js";

//最初にconfigureしないとenvironmentのログが出ない
log4js.configure({
  appenders: {
    out: { type: "stdout" },
    app: { type: "file", filename: "yosuga.log" },
    wrapErr: { type: "logLevelFilter", appender: "app", level: "warn" },
  },
  categories: {
    default: {
      appenders: ["out", "app"],
      level: "all",
    },
  },
});

const logger = log4js.getLogger();
logger.info("start process");
logger.debug(generateDependencyReport());

//======================================================================

const client: Client = new Discord.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

client.once("ready", (readyClient) => {
  const yosuga = new YosugaClient(readyClient);
  void yosuga.initClient();
});

client.on("shardError", (err) => {
  logger.error("handle shardError");
  logger.error(err);
});

client.on("error", (err) => {
  logger.error("handle error");
  logger.error(err);
});

process.on("unhandledRejection", (error) => {
  logger.error("handle unhandledRejection");
  logger.error(error);
});

void client.login(yosugaEnv.discordToken);

process.on("exit", (code) => {
  logger.info(`Exit... ${code}`);
  log4js.shutdown();
  client.destroy();
  logger.info("Destroy");
});
process.on("SIGINT", () => {
  process.exit(0);
});
