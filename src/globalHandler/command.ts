import { GlobalEventHandlerRegistrant } from "../types";
import log4js from "log4js";
import { StartCommand } from "../commands/startCommand";
import { EndCommand } from "../commands/endCommand";
import { ClearCommand } from "../commands/clearCommand";
import { HelpCommand } from "../commands/helpCommand";
import { VersionCommand } from "../commands/versionCommand";
import { ReloadCommand } from "../commands/reloadCommand";
import { CommandBase } from "../commands/commandBase";
import { client } from "../index";

const commandLogger = log4js.getLogger("command");

export const commandList = new Set<CommandBase>();
const commandRecord: Record<string, CommandBase> = {};

const assign = (command: CommandBase): void => {
  commandLogger.debug(`assignCommand: ${command.data.name} [${command.getTriggers()}]`);
  // commandMap[commandText] = action;
  commandList.add(command);

  command.getTriggers().forEach((commandTrigger) => {
    if (commandTrigger in commandRecord) {
      throw new Error(`コマンド名が重複しています: ${commandTrigger}`);
    }
    commandRecord[commandTrigger] = command;
  });
};

export const assignCommands = (): void => {
  commandLogger.debug("assign commands");
  assign(new StartCommand());
  assign(new EndCommand());
  assign(new ClearCommand());
  assign(new HelpCommand());
  assign(new VersionCommand());
  assign(new ReloadCommand());

  void createSlashCommands(commandList).catch((err) => {
    commandLogger.warn(err);
  });
};

const createSlashCommands = async (commandList: Set<CommandBase>) => {
  await Promise.all(
    Array.from(commandList).map(async (command: CommandBase) =>
      client.application?.commands.create(command.data)
    )
  );
};

export const registerCommandHandler: GlobalEventHandlerRegistrant = (emitter) => {
  commandLogger.debug("registerCommandHandler");
  emitter.on("command", (cmd, args, context) => {
    commandLogger.debug(`cmd: ${cmd} args: ${args}`);

    const command = commandRecord[cmd];
    if (!command) return;

    void command.execute(args, context).then((resEmbed) => {
      if (context.type === "interaction") {
        if (context.interaction.deferred) {
          void context.interaction.editReply({ embeds: [resEmbed] });
        } else {
          void context.interaction.reply({ embeds: [resEmbed] });
        }
      }
      if (context.type === "text") {
        void context.textChannel.send({ embeds: [resEmbed] });
      }
    });
  });
};
