import log4js from "log4js";
import Discord, { Client, Intents } from "discord.js";
import { generateDependencyReport } from "@discordjs/voice";
import { YosugaClient } from "./yosugaClient";

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

export const client: Client = new Discord.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

export const yosuga = new YosugaClient(client);
yosuga.initClient();

process.on("exit", () => {
  logger.info("Exit...");
  log4js.shutdown();
  client.destroy();
  logger.info("Destroy");
});
process.on("SIGINT", () => {
  process.exit(0);
});
