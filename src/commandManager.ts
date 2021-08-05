import { CommandBase } from "./commands/commandBase";
import log4js from "log4js";
import { Snowflake } from "discord.js";
import { YosugaClient } from "./yosugaClient";

const commandLogger = log4js.getLogger("command");

export class CommandManager {
  private readonly yosuga: YosugaClient;
  private readonly commandList = new Set<CommandBase>();
  readonly commandRecord: Record<string, CommandBase> = {};

  constructor(yosuga: YosugaClient) {
    this.yosuga = yosuga;
  }

  assign(command: CommandBase): void {
    commandLogger.debug(`assignCommand: ${command.data.name} [${command.getTriggers()}]`);

    this.commandList.add(command);

    command.getTriggers().forEach((commandTrigger) => {
      if (commandTrigger in this.commandRecord) {
        throw new Error(`コマンド名が重複しています: ${commandTrigger}`);
      }
      this.commandRecord[commandTrigger] = command;
    });
    // this.commandCollection.
  }

  async registerSlashCommand(guildId?: Snowflake): Promise<void> {
    const applicationCommands = Array.from(this.commandList).map((command) => command.data);

    const commands = this.yosuga.client.application?.commands;
    if (guildId) {
      await commands?.set(applicationCommands, guildId);
    } else {
      await commands?.set(applicationCommands);
    }
  }

  getCommand(trigger: string): CommandBase | null {
    return this.commandRecord[trigger];
  }

  getCommandList(triggerFilter?: string[]): CommandBase[] {
    const commands = Array.from(this.commandList);
    if (triggerFilter && triggerFilter.length > 0) {
      return commands.filter(
        (command) =>
          command.getTriggers().filter((trig) => triggerFilter.indexOf(trig) !== -1).length > 0
      );
    } else {
      return commands;
    }
  }
}
