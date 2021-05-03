import { Command, CommandExecutor, GlobalEventHandlerRegistrant } from "../types";
import log4js from "log4js";
import { startCommand } from "../commands/startCommand";
import { endCommand } from "../commands/endCommand";
import { clearCommand } from "../commands/clearCommand";
import { helpCommand } from "../commands/helpCommand";
import { versionCommand } from "../commands/versionCommand";
import { reloadCommand } from "../commands/reloadCommand";

const commandLogger = log4js.getLogger("command");

export const commandList = new Set<Command>();
const commandExeRecord: Record<string, CommandExecutor> = {};

const assign = (command: Command): void => {
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

export const assignCommands = (): void => {
  commandLogger.debug("assign commands");
  assign(startCommand);
  assign(endCommand);
  assign(clearCommand);
  assign(helpCommand);
  assign(versionCommand);
  assign(reloadCommand);
};

export const registerCommandHandler: GlobalEventHandlerRegistrant = (emitter) => {
  commandLogger.debug("registerCommandHandler");
  emitter.on("command", (cmd, args, context) => {
    commandLogger.debug(`cmd: ${cmd} args: ${args}`);
    commandLogger.debug(commandExeRecord);

    if (cmd in commandExeRecord) {
      void commandExeRecord[cmd](args, context).then((resEmbed) => {
        void context.textChannel.send(resEmbed);
      });
    }
  });
};
