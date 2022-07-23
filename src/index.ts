import { generateDependencyReport } from "@discordjs/voice";
import Discord, { GatewayIntentBits } from "discord.js";
import log4js from "log4js";

import { yosugaEnv } from "./environment";

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
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once("ready", (readyClient) => {
  // const yosuga = new YosugaClient(readyClient);
  // void yosuga.initClient();
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
