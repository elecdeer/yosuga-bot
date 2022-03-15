import assert from "assert";
import { Collection, Guild } from "discord.js";
import log4js from "log4js";

import { CommandPermission, hasMemberPermission } from "./application/permission";
import { CommandBase } from "./commands/commandBase";
import { GuildId } from "./types";
import { YosugaClient } from "./yosugaClient";

const commandLogger = log4js.getLogger("command");

export class CommandManager {
  private readonly yosuga: YosugaClient;

  readonly commandCollection = new Collection<string, CommandBase>();
  private readonly commandTriggerCollection = new Collection<string, CommandBase>();

  constructor(yosuga: YosugaClient) {
    this.yosuga = yosuga;
    this.attachHandler();
  }

  private attachHandler() {
    this.yosuga.event.on("command", async (cmd, context) => {
      commandLogger.debug(`cmd: ${cmd}`);

      const command = this.getCommand(cmd);
      if (!command) {
        await context.reply("warn", "不明なコマンドです.");
        return;
      }

      if (!(await hasMemberPermission(context.member, command.data.permission))) {
        await context.reply("prohibit", "このコマンドを実行する権限がありません.");
        return;
      }

      await command.execute(context).catch(async (err) => {
        await context.reply("warn", "エラーが発生しました.");
        commandLogger.error(err);
      });
    });
  }

  assign(command: CommandBase): void {
    commandLogger.debug(`assignCommand: ${command.data.name} [${command.getTriggers()}]`);
    this.commandCollection.set(command.data.name, command);

    command.getTriggers().forEach((trigger) => {
      if (this.commandTriggerCollection.has(trigger)) {
        throw new Error(`コマンド名が重複しています: ${trigger}`);
      }
      this.commandTriggerCollection.set(trigger, command);
    });
  }

  async registerSlashCommands(guild?: Guild): Promise<void> {
    commandLogger.debug("registerSlashCommands");

    const application = this.yosuga.client.application;
    assert(application);

    await application.commands.fetch();
    commandLogger.debug(application.commands);

    const registerCommands = this.commandCollection
      .filter((cmd) => cmd.isInteractionCommand())
      .map((cmd) => cmd.constructInteractionData());

    commandLogger.debug("registerCommand: ");
    registerCommands.forEach((cmd) => {
      commandLogger.debug(cmd);
    });

    if (guild) {
      const appCommands = await application.commands.set(registerCommands, guild.id);

      commandLogger.debug("deployed guild commands");
      appCommands.forEach((cmd) => {
        commandLogger.debug(` ${cmd.name}: ${cmd.id}`);
      });
    } else {
      const appCommands = await application.commands.set(registerCommands);

      commandLogger.debug("deployed global commands");
      appCommands.forEach((cmd) => {
        commandLogger.debug(` ${cmd.name}: ${cmd.id}`);
      });
    }
  }

  async unregisterGuildSlashCommands(guildId: GuildId): Promise<void> {
    const application = this.yosuga.client.application;
    assert(application);

    await application.commands.set([], guildId);
  }

  async unregisterGlobalSlashCommands(): Promise<void> {
    const application = this.yosuga.client.application;
    assert(application);

    await application.commands.set([]);
  }

  getCommand(trigger: string): CommandBase | undefined {
    return this.commandTriggerCollection.get(trigger);
  }

  getCommandList(
    permission: CommandPermission,
    triggerFilter?: string | string[]
  ): Collection<string, CommandBase> {
    commandLogger.debug(`trigger: ${triggerFilter}`);

    if (triggerFilter) {
      commandLogger.debug(`filter`);
      const list = [...triggerFilter];
      return this.commandTriggerCollection
        .filter((_, key) => list.includes(key))
        .filter((cmd) => cmd.data.permission <= permission);
    } else {
      commandLogger.debug(`all`);
      return this.commandCollection.filter((cmd) => cmd.data.permission <= permission);
    }
  }
}
