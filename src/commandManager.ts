import { CommandBase } from "./commands/commandBase";
import log4js from "log4js";
import { ApplicationCommand, Collection, Guild, Snowflake } from "discord.js";
import { YosugaClient } from "./yosugaClient";
import { CommandPermission, constructPermissionData, fetchPermission } from "./permissionUtil";

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
    this.yosuga.on("command", (cmd, context) => {
      commandLogger.debug(`cmd: ${cmd}`);

      //うーん
      void (async () => {
        const command = this.getCommand(cmd);
        if (!command) {
          await context.reply("warn", "不明なコマンドです");
          return;
        }

        if ((await fetchPermission(context.member)) < command.data.permission) {
          await context.reply("prohibit", "このコマンドを実行する権限がありません.");
          return;
        }

        await command.execute(context);
      })().catch((err) => {
        commandLogger.error(err);
      });
    });

    this.yosuga.on("addAdminRole", (role) => {
      void role.client
        .application!.commands.fetch()
        .then((commands) => this.registerGuildPermission(role.guild, commands));
    });

    this.yosuga.on("removeAdminRole", (role) => {
      void role.client
        .application!.commands.fetch()
        .then((commands) => this.registerGuildPermission(role.guild, commands));
    });

    this.yosuga.client.on("guildCreate", (guild: Guild) => {
      void guild.client
        .application!.commands.fetch()
        .then((commands) => this.registerGuildPermission(guild, commands));
    });
  }

  assign(command: CommandBase): void {
    commandLogger.debug(`assignCommand: ${command.data.name} [${command.getTriggers()}]`);
    this.commandCollection.set(command.data.name, command);

    if (command.isMessageCommand()) {
      command.getTriggers().forEach((trigger) => {
        if (this.commandTriggerCollection.has(trigger)) {
          throw new Error(`コマンド名が重複しています: ${trigger}`);
        }
        this.commandTriggerCollection.set(trigger, command);
      });
    }
  }

  async registerSlashCommands(guild?: Guild): Promise<void> {
    commandLogger.debug("registerSlashCommands");

    const application = this.yosuga.client.application;
    if (!application) {
      commandLogger.warn("application undefined");
      return;
    }

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

      await this.registerGuildPermission(guild, appCommands);
    } else {
      const appCommands = await application.commands.set(registerCommands);

      const guildManager = this.yosuga.client.guilds;
      await guildManager.fetch();

      await Promise.all(
        guildManager.cache.map((guild) => this.registerGuildPermission(guild, appCommands))
      );
    }
  }

  async registerGuildPermission(
    guild: Guild,
    appCommands: Collection<string, ApplicationCommand>
  ): Promise<unknown> {
    commandLogger.debug("registerGuildPermission");
    const commandManager = guild.client.application!.commands;

    commandLogger.debug(`commands: ${appCommands.size}`);

    return Promise.all(
      appCommands
        .filter((command) => !command.defaultPermission)
        .map(async (command) => {
          const commandData = this.commandCollection.get(command.name)!;

          commandLogger.debug(`command: ${commandData.data.name}`);

          const permission = await constructPermissionData(commandData.data.permission, guild);
          commandLogger.debug(permission);

          return await commandManager.permissions.set({
            command: command.id,
            guild: guild.id,
            permissions: permission.allowList,
          });
        })
    );
  }

  async unregisterSlashCommands(guildId?: Snowflake): Promise<void> {
    const application = this.yosuga.client.application;
    if (!application) {
      commandLogger.warn("application undefined");
      return;
    }

    await application.commands.set([]);
    if (guildId) {
      await application.commands.set([], guildId);
    }
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
