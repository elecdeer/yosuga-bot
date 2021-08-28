import { CommandBase } from "./commands/commandBase";
import log4js from "log4js";
import { Collection, Role, Snowflake } from "discord.js";
import { YosugaClient } from "./yosugaClient";
import { hasAdminPermission } from "./util";

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

      const command = this.getCommand(cmd);
      if (!command) return;

      void command.execute(context).catch((err) => {
        commandLogger.error(err);
      });
    });

    this.yosuga.on("addAdminRole", (role) => {
      // this.yosuga.client.application?.commands.permissions.add({
      //   command: this.commandList.
      // })
    });

    this.yosuga.on("removeAdminRole", (role) => {
      //
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

  async registerSlashCommands(guildId?: Snowflake): Promise<void> {
    const application = this.yosuga.client.application;
    if (!application) {
      commandLogger.warn("application undefined");
      return;
    }

    await application.commands.fetch();
    commandLogger.debug(application.commands);

    const applicationCommands = this.commandCollection
      .filter((cmd) => cmd.isInteractionCommand())
      .map((cmd) => cmd.constructInteractionData());

    if (guildId) {
      await application.commands.set(applicationCommands, guildId);
    } else {
      await application.commands.set(applicationCommands);
    }

    //TODO 権限

    // const adminRoles = await this.fetchAdminRoles();
    // commandManager?.permissions.

    await application.commands.fetch();
    commandLogger.debug(application.commands);
  }

  async unregisterSlashCommands(guildId?: Snowflake): Promise<void>{
    const application = this.yosuga.client.application;
    if(!application){
      commandLogger.warn("application undefined");
      return;
    }

    await application.commands.set([]);
    if(guildId){
      await application.commands.set([], guildId);
    }
  }

  getCommand(trigger: string): CommandBase | undefined{
    return this.commandTriggerCollection.get(trigger);
  }

  getCommandList(triggerFilter?: string | string[]): Collection<string, CommandBase>{
    commandLogger.debug(`trigger: ${triggerFilter}`);
    if(triggerFilter){
      commandLogger.debug(`filter`);
      const list = [...triggerFilter];
      return this.commandTriggerCollection.filter((_, key) => list.includes(key));
    } else {
      commandLogger.debug(`all`);
      return this.commandCollection;
    }
  }

  private async fetchAdminRoles(): Promise<Collection<Snowflake, Role>> {
    const client = this.yosuga.client;
    await client.guilds.fetch();

    const guilds = client.guilds.cache;

    await Promise.all(guilds.map((guild) => guild.roles.fetch()));

    const collection = new Collection<Snowflake, Role>();
    const roles = guilds.reduce((acc: Collection<Snowflake, Role>, guild) => {
      return acc.concat(guild.roles.cache);
    }, collection);

    return roles.filter((role) => hasAdminPermission(role));
  }
}
