import { Guild, GuildMember, Message, TextChannel } from "discord.js";
import StrictEventEmitter from "strict-event-emitter-types";
import EventEmitter from "events";
import { YosugaEventEmitter } from "./yosugaEventEmitter";
import { VoiceOrStageChannel } from "./types";

// const logger = getLogger("session");

interface Events {
  message: (message: Message) => void;
  enterChannel: (member: GuildMember) => void;
  leaveChannel: (member: GuildMember) => void;
  turnOnVideo: (member: GuildMember) => void;
  turnOffVideo: (member: GuildMember) => void;
  turnOnGoLive: (member: GuildMember) => void;
  turnOffGoLive: (member: GuildMember) => void;
  disconnect: () => void;
}

type SessionStrictEmitter = StrictEventEmitter<EventEmitter, Events>;

export class SessionEmitter extends (EventEmitter as { new (): SessionStrictEmitter }) {
  protected voiceChannel: VoiceOrStageChannel;
  protected textChannel: TextChannel;
  protected readonly guild: Guild;

  constructor(
    globalEmitter: YosugaEventEmitter,
    voiceChannel: VoiceOrStageChannel,
    textChannel: TextChannel
  ) {
    super();

    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.guild = voiceChannel.guild;

    globalEmitter.on("message", (guildId, message) => {
      if (guildId !== this.guild.id) return;
      if (message.channel.id !== this.textChannel.id) return;
      this.emit("message", message);
    });

    globalEmitter.on("moveChannel", (guildId, member, from, to) => {
      if (guildId !== this.guild.id) return;
      if (from?.id !== this.voiceChannel.id && to?.id === this.voiceChannel.id) {
        this.emit("enterChannel", member);
      }
      if (from?.id === this.voiceChannel.id && to?.id !== this.voiceChannel.id) {
        this.emit("leaveChannel", member);
      }
    });

    globalEmitter.on("turnOnVideo", (guildId, member) => {
      if (guildId !== this.guild.id) return;
      if (member.voice.channel?.id !== this.voiceChannel.id) return;
      this.emit("turnOnVideo", member);
    });

    globalEmitter.on("turnOffVideo", (guildId, member) => {
      if (guildId !== this.guild.id) return;
      if (member.voice.channel?.id !== this.voiceChannel.id) return;
      this.emit("turnOffVideo", member);
    });

    globalEmitter.on("turnOnGoLive", (guildId, member) => {
      if (guildId !== this.guild.id) return;
      if (member.voice.channel?.id !== this.voiceChannel.id) return;
      this.emit("turnOnGoLive", member);
    });

    globalEmitter.on("turnOffGoLive", (guildId, member) => {
      if (guildId !== this.guild.id) return;
      if (member.voice.channel?.id !== this.voiceChannel.id) return;
      this.emit("turnOffGoLive", member);
    });
  }
}
