import EventEmitter from "events";
import { Client, GuildMember, Message, TextChannel, VoiceChannel } from "discord.js";
import StrictEventEmitter from "strict-event-emitter-types";

import log4js from "log4js";
import { getGuildConfig } from "./configManager";
import { CommandContext } from "./types";
import { getSession } from "./sessionManager";

const logger = log4js.getLogger("yosugaEvent");

interface Events {
  command: (cmd: string, args: string[], context: CommandContext) => Promise<void>;
  message: (guildId: string, message: Message) => void;
  moveChannel: (
    guildId: string,
    member: GuildMember,
    from: VoiceChannel | null,
    to: VoiceChannel | null
  ) => void;
  turnOnVideo: (guildId: string, member: GuildMember) => void;
  turnOffVideo: (guildId: string, member: GuildMember) => void;
  turnOnGoLive: (guildId: string, member: GuildMember) => void;
  turnOffGoLive: (guildId: string, member: GuildMember) => void;
  destroy: () => void;
}

// export const registerHandler = () => {
//
// }

type YosugaEmitter = StrictEventEmitter<EventEmitter, Events>;

export class YosugaEventEmitter extends (EventEmitter as { new (): YosugaEmitter }) {
  constructor(client: Client) {
    super();

    client.once("ready", () => {
      logger.info("bot ready");
    });

    client.on("message", (message) => {
      logger.debug("handle message");
      if (!message.guild) return;
      if (message.author.bot) return;
      if (!message.member) return;
      if (!message.channel.isText()) return;

      const guildId = message.guild.id;
      const config = getGuildConfig(guildId);

      const messageSlice = message.content.trim().split(" ");
      const prefix = messageSlice.shift() ?? "";
      const command = messageSlice.shift() ?? "";

      // const session = getSession(guildId);

      logger.debug(`at guild: ${guildId}`);
      logger.debug(`input prefix: ${prefix}  configPrefix: ${config.commandPrefix}`);

      if (prefix === config.commandPrefix) {
        const context: CommandContext = {
          session: getSession(guildId),
          config: config,
          guild: message.guild,
          user: message.member,
          textChannel: message.channel as TextChannel,
        };

        logger.debug("emit command");
        this.emit("command", command, messageSlice, context);
      } else {
        logger.debug("emit message");
        this.emit("message", guildId, message);
      }
    });

    client.on("voiceStateUpdate", (oldState, newState) => {
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
    });

    process.on("exit", () => {
      this.emit("destroy");
    });
  }
}
