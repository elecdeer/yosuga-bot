import log4js from "log4js";

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

import Discord, { Client } from "discord.js";
import axios from "axios";

import { setHandler } from "./eventHandler";
import { assignCommands } from "./commands/commands";
import { yosugaEnv } from "./environment";

const logger = log4js.getLogger();

logger.info("start process");

export const client: Client = new Discord.Client();

setHandler(client);
assignCommands();

client
  .login(yosugaEnv.discordToken)
  .then((res) => {
    logger.info("bot login");
    logger.info(`token: ${res}`);
  })
  .catch((err) => {
    logger.error("failed to login discord");
    logger.error(err);
  });

process.on("exit", function () {
  logger.info("Exit...");
  log4js.shutdown();
  client.destroy();
  logger.info("Destroy");
});
process.on("SIGINT", function () {
  process.exit(0);
});
