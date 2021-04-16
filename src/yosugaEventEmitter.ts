import EventEmitter from "events";
import { Client, GuildMember, Message, VoiceChannel } from "discord.js";
import StrictEventEmitter from "strict-event-emitter-types";
import { Session } from "./session";
import log4js from "log4js";
import { getGuildConfig } from "./configManager";

const logger = log4js.getLogger("yosugaEvent");

interface Events {
  command: (cmd: string, args: string[], message: Message, session: Session | null) => void;
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
}

type YosugaEmitter = StrictEventEmitter<EventEmitter, Events>;

export class YosugaEventEmitter extends (EventEmitter as { new (): YosugaEmitter }) {
  constructor(client: Client) {
    super();

    client.once("ready", () => {
      logger.info("bot ready");
    });

    client.on("message", (message) => {
      if (!message.guild) return;
      if (message.author.bot) return;

      const guildId = message.guild.id;
      const config = getGuildConfig(guildId);

      const messageSlice = message.content.slice(config.commandPrefix.length).trim().split(" ");
      const command = messageSlice.shift() ?? "";

      if (command === config.commandPrefix) {
        this.emit("command", command, messageSlice, message, null);
      } else {
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
      }

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
    });
  }
}
