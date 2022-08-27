import { generateDependencyReport } from "@discordjs/voice";
import Discord, { GatewayIntentBits } from "discord.js";
import log4js from "log4js";

import { imageEnv, yosugaEnv } from "./environment";
import { initLogger } from "./logger";
import { Yosuga } from "./yosuga";

import type { Client } from "discord.js";

initLogger();

const logger = log4js.getLogger();
logger.info("start process");
logger.debug(generateDependencyReport());
logger.info("imageEnv", imageEnv);

//======================================================================

const client: Client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once("ready", (readyClient) => {
  logger.info("client ready");
  const yosuga = new Yosuga(readyClient);
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
