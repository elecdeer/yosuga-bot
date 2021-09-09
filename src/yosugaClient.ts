import { Client, ClientApplication } from "discord.js";
import { getLogger } from "log4js";
import path from "path";

import { CommandManager } from "./commandManager";
import { ClearCommand } from "./commands/clearCommand";
import { DeployGlobalCommand } from "./commands/deployGlobalCommand";
import { DeployGuildCommand } from "./commands/deployGuildCommand";
import { EndCommand } from "./commands/endCommand";
import { GuildConfigCommand } from "./commands/guildConfigCommand";
import { HelpCommand } from "./commands/helpCommand";
import { MasterConfigCommand } from "./commands/masterConfigCommand";
import { StartCommand } from "./commands/startCommand";
import { UndeployGlobalCommand } from "./commands/undeployGlobalCommand";
import { UndeployGuildCommand } from "./commands/undeployGuildCommand";
import { UserConfigCommand } from "./commands/userConfigCommand";
import { VersionCommand } from "./commands/versionCommand";
import { VoiceStatusCommand } from "./commands/voiceStatusCommand";
import { ConfigManager } from "./config/configManager";
import { KvsGuildConfigStore } from "./config/kvsGuildConfigStore";
import { KvsMasterConfigStore } from "./config/kvsMasterConfigStore";
import { KvsUserConfigStore } from "./config/kvsUserConfigStore";
import { yosugaEnv } from "./environment";
import { SessionManager } from "./sessionManager";
import { YosugaEvent } from "./yosugaEvent";

const logger = getLogger("yosugaClient");

export class YosugaClient {
  readonly client: Client;

  readonly event: YosugaEvent;

  readonly commandManager: CommandManager;
  readonly sessionManager: SessionManager;
  readonly configManager: ConfigManager;

  constructor(discordClient: Client) {
    this.client = discordClient;

    this.commandManager = new CommandManager(this);
    this.sessionManager = new SessionManager(this);
    this.configManager = new ConfigManager(this, {
      master: new KvsMasterConfigStore({
        name: "master-config",
        storeFilePath: path.join(yosugaEnv.configPath, "masterConfig"),
      }),
      guild: new KvsGuildConfigStore({
        name: "guild-config",
        storeFilePath: path.join(yosugaEnv.configPath, "guildConfig"),
      }),
      user: new KvsUserConfigStore({
        name: "user-config",
        storeFilePath: path.join(yosugaEnv.configPath, "userConfig"),
      }),
    });

    this.event = new YosugaEvent(this);
  }

  async initClient(): Promise<void> {
    try {
      const token = await this.client.login(yosugaEnv.discordToken);
      this.client.application = new ClientApplication(this.client, {});

      await this.client.application.fetch();
      await this.client.application.commands.fetch();
      logger.debug(this.client.application.commands.cache.toJSON());

      logger.info("bot login");
      logger.info(`token: ${token}`);
      logger.info(`applicationOwner: ${this.client.application?.owner}`);

      this.assignCommands();

      this.event.attachEvents();
    } catch (err) {
      logger.error("failed to login discord");
      logger.error(err);
    }
  }

  protected assignCommands(): void {
    logger.debug("assign commands");
    this.commandManager.assign(new StartCommand());
    this.commandManager.assign(new EndCommand());
    this.commandManager.assign(new ClearCommand());
    this.commandManager.assign(new HelpCommand());
    this.commandManager.assign(new VersionCommand());
    this.commandManager.assign(new DeployGlobalCommand());
    this.commandManager.assign(new DeployGuildCommand());
    this.commandManager.assign(new UndeployGlobalCommand());
    this.commandManager.assign(new UndeployGuildCommand());
    this.commandManager.assign(new MasterConfigCommand());
    this.commandManager.assign(new GuildConfigCommand());
    this.commandManager.assign(new UserConfigCommand());
    this.commandManager.assign(new VoiceStatusCommand());
  }
}
