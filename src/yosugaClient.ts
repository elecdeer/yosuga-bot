import {
  Client,
  ClientApplication,
  CommandInteraction,
  GuildMember,
  Message,
  Role,
  Snowflake,
  VoiceState,
} from "discord.js";
import EventEmitter from "events";
import { getLogger } from "log4js";

import { CommandContext } from "./commandContext";
import { CommandContextSlash, isValidCommandInteraction } from "./commandContextSlash";
import { CommandContextText, isValidMessage } from "./commandContextText";
import { CommandManager } from "./commandManager";
import { ClearCommand } from "./commands/clearCommand";
import { DeployGlobalCommand } from "./commands/deployGlobalCommand";
import { DeployGuildCommand } from "./commands/deployGuildCommand";
import { DeployResetCommand } from "./commands/deployResetCommand";
import { EndCommand } from "./commands/endCommand";
import { GuildConfigCommand } from "./commands/guildConfigCommand";
import { HelpCommand } from "./commands/helpCommand";
import { MasterConfigCommand } from "./commands/masterConfigCommand";
import { ReloadCommand } from "./commands/reloadCommand";
import { StartCommand } from "./commands/startCommand";
import { UserConfigCommand } from "./commands/userConfigCommand";
import { VersionCommand } from "./commands/versionCommand";
import { VoiceStatusCommand } from "./commands/voiceStatusCommand";
import { ConfigManager } from "./configManager";
import { yosugaEnv } from "./environment";
import { yosuga } from "./index";
import { hasAdminPermission } from "./permissionUtil";
import { SessionManager } from "./sessionManager";
import { EventsBase, TypedEventEmitter, VoiceOrStageChannel } from "./types";

const logger = getLogger("yosugaClient");

interface Events extends EventsBase {
  command: [cmd: string, context: CommandContext];
  message: [guildId: Snowflake, message: Message];
  moveChannel: [
    guildId: Snowflake,
    member: GuildMember,
    from: VoiceOrStageChannel | null,
    to: VoiceOrStageChannel | null
  ];
  turnOnVideo: [guildId: Snowflake, member: GuildMember];
  turnOffVideo: [guildId: Snowflake, member: GuildMember];
  turnOnGoLive: [guildId: Snowflake, member: GuildMember];
  turnOffGoLive: [guildId: Snowflake, member: GuildMember];
  addAdminRole: [role: Role];
  removeAdminRole: [role: Role];
  destroy: [];
}

export class YosugaClient extends (EventEmitter as { new (): TypedEventEmitter<Events> }) {
  readonly client: Client;

  readonly commandManager: CommandManager;
  readonly sessionManager: SessionManager;
  readonly configManager: ConfigManager;

  constructor(discordClient: Client) {
    super();

    this.client = discordClient;

    this.commandManager = new CommandManager(this);
    this.sessionManager = new SessionManager(this);
    this.configManager = new ConfigManager(this);
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

      await this.configManager.initialize();

      this.assignCommands();
      this.attachEvents(this.client);
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
    // this.commandManager.assign(new ReloadCommand());
    this.commandManager.assign(new DeployGlobalCommand());
    this.commandManager.assign(new DeployGuildCommand());
    this.commandManager.assign(new DeployResetCommand());
    this.commandManager.assign(new MasterConfigCommand());
    this.commandManager.assign(new GuildConfigCommand());
    this.commandManager.assign(new UserConfigCommand());
    this.commandManager.assign(new VoiceStatusCommand());
  }

  //=========================================
  // Events
  //=========================================

  private attachEvents(client: Client) {
    client.once("ready", () => {
      logger.info("bot ready");
    });

    client.on("messageCreate", async (message) => {
      await this.onMessageCreate(message);
    });

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) return;
      await this.onCommandInteractionCreate(interaction);
    });

    client.on("voiceStateUpdate", (oldState, newState) => {
      this.onVoiceStateUpdate(newState, oldState);
    });

    client.on("roleCreate", (role) => {
      this.onRoleCreate(role);
    });
    client.on("roleDelete", (role) => {
      this.onRoleDelete(role);
    });
    client.on("roleUpdate", (oldRole, newRole) => {
      this.onRoleUpdate(oldRole, newRole);
    });

    process.on("exit", () => {
      this.emit("destroy");
    });
  }

  private async onMessageCreate(message: Message) {
    logger.debug("handle message");
    if (!isValidMessage(message)) {
      return;
    }

    const guildId = message.guild.id;
    const config = await this.configManager.getUnifiedConfig(guildId);

    const messageSlice = message.content.trim().split(" ");
    const prefix = messageSlice.shift() ?? "";
    const command = messageSlice.shift() ?? "";

    // const session = getSession(guildId);

    logger.debug(`at guild: ${guildId} from user: ${message.author.id}`);
    logger.debug(`input prefix: ${prefix}  configPrefix: ${config.commandPrefix}`);

    if (prefix === config.commandPrefix) {
      const context = new CommandContextText(message, yosuga);

      logger.debug("emit command");
      this.emit("command", command, context);
    } else {
      logger.debug("emit message");
      this.emit("message", guildId, message);
    }
  }

  private async onCommandInteractionCreate(interaction: CommandInteraction) {
    logger.debug(`receive interaction`);
    logger.debug(interaction.toJSON());

    if (!isValidCommandInteraction(interaction)) {
      return;
    }

    const context = new CommandContextSlash(interaction, yosuga);

    logger.debug("emit command");

    this.emit("command", interaction.commandName, context);
  }

  private onVoiceStateUpdate(newState: VoiceState, oldState: VoiceState) {
    if (!newState.guild.id) return;
    const guildId = newState.guild.id;

    if (oldState.member !== newState.member) return;
    if (!oldState.member || !newState.member) return;

    if (oldState.channel?.id !== newState.channel?.id) {
      this.emit("moveChannel", guildId, newState.member, oldState.channel, newState.channel);
      return;
    }

    if (oldState.channel?.id === newState.channel?.id && !!oldState.channel?.id) {
      if (!oldState.selfVideo && newState.selfVideo) {
        this.emit("turnOnVideo", guildId, newState.member);
        return;
      }

      if (oldState.selfVideo && !newState.selfVideo) {
        this.emit("turnOffVideo", guildId, newState.member);
        return;
      }

      if (!oldState.streaming && newState.streaming) {
        this.emit("turnOnGoLive", guildId, newState.member);
        return;
      }

      if (oldState.streaming && !newState.streaming) {
        this.emit("turnOffGoLive", guildId, newState.member);
        return;
      }
    }
  }

  private onRoleCreate(role: Role) {
    if (hasAdminPermission(role)) {
      this.emit("addAdminRole", role);
    }
  }

  private onRoleDelete(role: Role) {
    if (hasAdminPermission(role)) {
      this.emit("removeAdminRole", role);
    }
  }

  private onRoleUpdate(oldRole: Role, newRole: Role) {
    //失った
    if (hasAdminPermission(oldRole) && !hasAdminPermission(newRole)) {
      this.emit("removeAdminRole", oldRole);
    }
    //得た
    if (!hasAdminPermission(oldRole) && hasAdminPermission(newRole)) {
      this.emit("addAdminRole", newRole);
    }
  }
}
