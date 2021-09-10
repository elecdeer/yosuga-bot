import { CommandInteraction, GuildMember, Message, Role, Snowflake, VoiceState } from "discord.js";
import EventEmitter from "events";
import { getLogger } from "log4js";

import { CommandContext } from "./commandContext";
import { CommandContextSlash, isValidCommandInteraction } from "./commandContextSlash";
import { CommandContextText, isValidMessage } from "./commandContextText";
import { hasAdminPermission } from "./permissionUtil";
import { EventsBase, TypedEventEmitter, VoiceOrStageChannel } from "./types";
import { YosugaClient } from "./yosugaClient";

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

const logger = getLogger("yosugaEvent");

export class YosugaEvent extends (EventEmitter as { new (): TypedEventEmitter<Events> }) {
  readonly yosuga: YosugaClient;

  constructor(yosuga: YosugaClient) {
    super();
    this.yosuga = yosuga;
  }

  attachEvents(): void {
    const client = this.yosuga.client;

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
    const configAccessor = this.yosuga.configManager.getUnifiedConfigAccessor(guildId);

    const messageSlice = message.content.trim().split(" ");
    const prefix = messageSlice.shift() ?? "";
    const command = messageSlice.shift() ?? "";

    // const session = getSession(guildId);

    const commandPrefix = await configAccessor.get("commandPrefix");
    logger.debug(`at guild: ${guildId} from user: ${message.author.id}`);
    logger.debug(`input prefix: ${prefix}  configPrefix: ${commandPrefix}`);

    if (prefix === commandPrefix) {
      const context = new CommandContextText(message, this.yosuga);

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

    const context = new CommandContextSlash(interaction, this.yosuga);

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
