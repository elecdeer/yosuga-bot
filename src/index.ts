import log4js from "log4js";
import Discord, { Client, Intents } from "discord.js";
import { yosugaEnv } from "./environment";
import { YosugaEventEmitter } from "./yosugaEventEmitter";
import { assignCommands, registerCommandHandler } from "./globalHandler/command";
import { registerSessionFactory } from "./sessionManager";

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

//======================================================================

export const client: Client = new Discord.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

client
  .login(yosugaEnv.discordToken)
  .then((res) => {
    logger.info("bot login");
    logger.info(`token: ${res}`);

    initEmitter();
    assignCommands();
  })
  .catch((err) => {
    logger.error("failed to login discord");
    logger.error(err);
  });

const initEmitter = () => {
  const globalEmitter = new YosugaEventEmitter(client);
  registerSessionFactory(globalEmitter);
  registerCommandHandler(globalEmitter);
};

process.on("exit", () => {
  logger.info("Exit...");
  log4js.shutdown();
  client.destroy();
  logger.info("Destroy");
});
process.on("SIGINT", () => {
  process.exit(0);
});
