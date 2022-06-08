import { getLogger } from "log4js";

import type { CommandHandler } from "../handler/base/commandHandler";
import type {
  ApplicationCommandData,
  ChatInputApplicationCommandData,
  Client,
  Guild,
} from "discord.js";

const logger = getLogger("CommandRegister");

export const registerApplicationCommands = async (
  client: Client<true>,
  commandDataList: ApplicationCommandData[],
  guild?: Guild
): Promise<void> => {
  const application = client.application;
  await application.commands.fetch();

  logger.debug("registerCommand: ");
  commandDataList.forEach((cmd) => {
    logger.debug(cmd);
  });

  if (guild) {
    const appCommands = await application.commands.set(commandDataList, guild.id);

    logger.debug("deployed guild commands");
    appCommands.forEach((cmd) => {
      logger.debug(` ${cmd.name}: ${cmd.id}`);
    });
  } else {
    const appCommands = await application.commands.set(commandDataList);

    logger.debug("deployed global commands");
    appCommands.forEach((cmd) => {
      logger.debug(` ${cmd.name}: ${cmd.id}`);
    });
  }
};

export const unregisterApplicationCommand = async (
  client: Client<true>,
  guild?: Guild
): Promise<void> => {
  const application = client.application;
  await application.commands.fetch();

  if (guild) {
    await application.commands.set([], guild.id);
  } else {
    await application.commands.set([]);
  }
};

export const constructApplicationCommandsData = (
  commands: CommandHandler[]
): ChatInputApplicationCommandData[] => {
  return commands.map((com) => com.constructInteractionData());
};
