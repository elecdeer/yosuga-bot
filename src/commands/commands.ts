import { Message, MessageEmbed, TextChannel } from "discord.js";

import log4js from "log4js";
import { Session } from "../session";
import { startCommand } from "./startCommand";
import { endCommand } from "./endCommand";
import { clearCommand } from "./clearCommand";
import { helpCommand } from "./helpCommand";
import { GuildConfigWithoutVoice } from "../configManager";

export const logger = log4js.getLogger("command");

// export type Command = (args: Array<string>,message: Message, session: Session | null, config: ServerConfig) => Promise<void>;

export type CommandExecutor = (
  args: Array<string>,
  message: Message,
  session: Session | null,
  config: GuildConfigWithoutVoice
) => Promise<void>;
export type Command = {
  trigger: string[];
  description: string;
  usage: string;
  execute: CommandExecutor;
};

export const commandList = new Set<Command>();
const commandExeRecord: Record<string, CommandExecutor> = {};

export const assign = (command: Command): void => {
  // logger.debug(`assignCommand: ${commandText}`)
  // commandMap[commandText] = action;
  commandList.add(command);

  command.trigger.forEach((commandTrigger) => {
    if (commandTrigger in commandExeRecord) {
      throw new Error("コマンド名が重複しています");
    }

    commandExeRecord[commandTrigger] = command.execute;
  });
};

export const createEmbedBase = (): MessageEmbed => {
  return new MessageEmbed().setTitle("Yosuga").setColor(0xffb6c1);
};

export const assignCommands = (): void => {
  logger.debug("assign commands");
  assign(startCommand);
  assign(endCommand);
  assign(clearCommand);
  assign(helpCommand);
};

export const handleCommand = async (
  message: Message,
  session: Session | null,
  config: GuildConfigWithoutVoice
): Promise<void> => {
  logger.debug("handleCommand");
  if (!message.guild) return;

  const channel = message.channel;
  if (!(channel instanceof TextChannel)) return;

  const args = message.content.slice(config.commandPrefix.length).trim().split(" ");
  const command = args.shift() ?? "";
  logger.debug(`content: ${message.content} command: ${command} args: ${args}`);

  if (command in commandExeRecord) {
    await commandExeRecord[command](args, message, session, config);
  }
};
