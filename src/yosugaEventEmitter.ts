import EventEmitter from "events";
import {
  Client,
  CommandInteraction,
  GuildMember,
  Message,
  Role,
  Snowflake,
  VoiceState,
} from "discord.js";
import StrictEventEmitter from "strict-event-emitter-types";

import log4js from "log4js";
import { getGuildConfig } from "./configManager";
import { VoiceOrStageChannel } from "./types";
import { yosuga } from "./index";
import { hasAdminPermission } from "./util";
import { CommandContext } from "./commandContext";
import { CommandContextText, isValidMessage } from "./commandContextText";
import { CommandContextSlash, isValidCommandInteraction } from "./commandContextSlash";

const logger = log4js.getLogger("yosugaEvent");

interface Events {
  command: (cmd: string, context: CommandContext) => Promise<void>;
  message: (guildId: Snowflake, message: Message) => void;
  moveChannel: (
    guildId: Snowflake,
    member: GuildMember,
    from: VoiceOrStageChannel | null,
    to: VoiceOrStageChannel | null
  ) => void;
  turnOnVideo: (guildId: Snowflake, member: GuildMember) => void;
  turnOffVideo: (guildId: Snowflake, member: GuildMember) => void;
  turnOnGoLive: (guildId: Snowflake, member: GuildMember) => void;
  turnOffGoLive: (guildId: Snowflake, member: GuildMember) => void;
  addAdminRole: (role: Role) => void;
  removeAdminRole: (role: Role) => void;
  destroy: () => void;
}

type YosugaEmitter = StrictEventEmitter<EventEmitter, Events>;

export class YosugaEventEmitter extends (EventEmitter as { new (): YosugaEmitter }) {
  constructor(client: Client) {
    super();

    client.once("ready", () => {
      logger.info("bot ready");
    });

    client.on("messageCreate", (message) => {
      this.onMessageCreate(message);
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

  private onMessageCreate(message: Message) {
    logger.debug("handle message");
    if (!isValidMessage(message)) {
      return;
    }

    const guildId = message.guild.id;
    const config = getGuildConfig(guildId);

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
