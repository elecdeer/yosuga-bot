import { generateDependencyReport } from "@discordjs/voice";
import Discord, { GatewayIntentBits } from "discord.js";

import { imageEnv, yosugaEnv } from "./environment";
import { getLogger } from "./logger";
import { Yosuga } from "./yosuga";

import type { Client } from "discord.js";

const logger = getLogger("main");

logger.info("start process");
logger.debug(generateDependencyReport());
logger.info("imageEnv", imageEnv);

//======================================================================

const client: Client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
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
  logger.info(`process exit: ${code}`);
  client.destroy();
});
process.on("SIGINT", () => {
  process.exit(0);
});
