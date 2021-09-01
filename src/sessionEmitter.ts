import { Guild, GuildMember, Message, TextChannel } from "discord.js";
import EventEmitter from "events";

import { EventsBase, TypedEventEmitter, VoiceOrStageChannel } from "./types";
import { YosugaClient } from "./yosugaClient";

// const logger = getLogger("session");

interface Events extends EventsBase {
  message: [message: Message];
  enterChannel: [member: GuildMember];
  leaveChannel: [member: GuildMember];
  turnOnVideo: [member: GuildMember];
  turnOffVideo: [member: GuildMember];
  turnOnGoLive: [member: GuildMember];
  turnOffGoLive: [member: GuildMember];
  disconnect: [];
}

// type Events = {};

export class SessionEmitter extends (EventEmitter as { new (): TypedEventEmitter<Events> }) {
  readonly yosuga: YosugaClient;
  protected voiceChannel: VoiceOrStageChannel;
  protected textChannel: TextChannel;
  protected readonly guild: Guild;

  constructor(yosuga: YosugaClient, voiceChannel: VoiceOrStageChannel, textChannel: TextChannel) {
    super();

    this.yosuga = yosuga;
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.guild = voiceChannel.guild;

    yosuga.on("message", (guildId, message) => {
      if (guildId !== this.guild.id) return;
      if (message.channel.id !== this.textChannel.id) return;
      this.emit("message", message);
    });

    yosuga.on("moveChannel", (guildId, member, from, to) => {
      if (guildId !== this.guild.id) return;
      if (from?.id !== this.voiceChannel.id && to?.id === this.voiceChannel.id) {
        this.emit("enterChannel", member);
      }
      if (from?.id === this.voiceChannel.id && to?.id !== this.voiceChannel.id) {
        this.emit("leaveChannel", member);
      }
    });

    yosuga.on("turnOnVideo", (guildId, member) => {
      if (guildId !== this.guild.id) return;
      if (member.voice.channel?.id !== this.voiceChannel.id) return;
      this.emit("turnOnVideo", member);
    });

    yosuga.on("turnOffVideo", (guildId, member) => {
      if (guildId !== this.guild.id) return;
      if (member.voice.channel?.id !== this.voiceChannel.id) return;
      this.emit("turnOffVideo", member);
    });

    yosuga.on("turnOnGoLive", (guildId, member) => {
      if (guildId !== this.guild.id) return;
      if (member.voice.channel?.id !== this.voiceChannel.id) return;
      this.emit("turnOnGoLive", member);
    });

    yosuga.on("turnOffGoLive", (guildId, member) => {
      if (guildId !== this.guild.id) return;
      if (member.voice.channel?.id !== this.voiceChannel.id) return;
      this.emit("turnOffGoLive", member);
    });
  }
}
