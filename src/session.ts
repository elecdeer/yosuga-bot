import {
  Guild,
  GuildMember,
  Message,
  TextChannel,
  VoiceChannel,
  VoiceConnection,
} from "discord.js";
import { PartiallyPartial, SpeechText } from "./types";
import { getGuildConfig, getVoiceConfig } from "./configManager";
import { createEmbedBase } from "./commands/commands";
import { createSpeakerMap, SpeakerMap } from "./speaker/speakersBuilder";
import { getLogger } from "log4js";
import StrictEventEmitter from "strict-event-emitter-types";
import EventEmitter from "events";
import { YosugaEventEmitter } from "./yosugaEventEmitter";
import { createSpeechQueue, SpeechQueue } from "./speechQueue";

const logger = getLogger("session");

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

type SessionEmitter = StrictEventEmitter<EventEmitter, Events>;

// const sessionStateMap: Record<string, Session> = {};
//
// const getSession = (guildId: string): Session | null => {
//   if (guildId in sessionStateMap) {
//     return sessionStateMap[guildId];
//   } else {
//     return null;
//   }
// };

type PushSpeechRecord = {
  timestamp: number;
  author:
    | {
        type: "member";
        memberId: string;
      }
    | {
        type: "yosuga";
      }
    | {
        type: "unknown";
      };
};

export class Session extends (EventEmitter as { new (): SessionEmitter }) {
  private readonly voiceChannel: VoiceChannel;
  private textChannel: TextChannel;
  private readonly guild: Guild;
  readonly connection: VoiceConnection;
  private speechQueue: SpeechQueue;
  private readonly speakerMap: SpeakerMap;
  lastPushedSpeech: PushSpeechRecord;

  constructor(
    yosugaEmitter: YosugaEventEmitter,
    voiceChannel: VoiceChannel,
    connection: VoiceConnection,
    textChannel: TextChannel
  ) {
    super();
    this.voiceChannel = voiceChannel;
    this.connection = connection;
    this.textChannel = textChannel;
    this.guild = voiceChannel.guild;

    this.speakerMap = createSpeakerMap(voiceChannel.guild.id);
    this.speechQueue = this.initializeQueue();
    this.lastPushedSpeech = {
      timestamp: 0,
      autor: {
        type: "unknown",
      },
    };

    yosugaEmitter.on("message", (guildId, message) => {
      if (guildId !== this.guild.id) return;
      if (message.channel.id !== this.textChannel.id) return;
      this.emit("message", message);
    });

    yosugaEmitter.on("moveChannel", (guildId, member, from, to) => {
      if (guildId !== this.guild.id) return;
      if (from && from.id === this.voiceChannel.id && to?.id !== this.voiceChannel.id) {
        this.emit("leaveChannel", member);
        return;
      }
      if (to && to.id === this.voiceChannel.id && from?.id !== this.voiceChannel.id) {
        this.emit("enterChannel", member);
        return;
      }
    });

    yosugaEmitter.on("turnOnGoLive", (guildId, message) => {
      if (guildId !== this.guild.id) return;
      this.emit("turnOnGoLive", message);
    });

    yosugaEmitter.on("turnOffGoLive", (guildId, message) => {
      if (guildId !== this.guild.id) return;
      this.emit("turnOffGoLive", message);
    });

    yosugaEmitter.on("turnOnVideo", (guildId, message) => {
      if (guildId !== this.guild.id) return;
      this.emit("turnOnVideo", message);
    });

    yosugaEmitter.on("turnOffVideo", (guildId, message) => {
      if (guildId !== this.guild.id) return;
      this.emit("turnOffVideo", message);
    });
  }

  initializeQueue(): SpeechQueue {
    this.speechQueue?.kill();
    this.speechQueue = createSpeechQueue(this.guild.id, this.speakerMap, this.connection);
    return this.speechQueue;
  }

  // async connectVoiceChannel(): Promise<void> {
  //   this.connection = await this.voiceChannel.join();
  // }

  disconnect(): void {
    logger.info(`disconnect: ${this.voiceChannel.id}`);
    this.connection?.disconnect();
    this.speechQueue.kill();
    // disposeSpeakerMap(this.guild.id);
    this.emit("disconnect");
    // this.off()
    // delete sessionStateMap[this.guild.id];
  }

  pushSpeech(
    param: PartiallyPartial<SpeechText, "speed" | "volume">,
    userId?: string,
    timestamp?: number
  ): void {
    // logger.debug("push speeech queue", param.Text);

    logger.debug(this.speakerMap);

    //check状態のことを考えるべきかも
    const voiceParam = getVoiceConfig(this.speakerMap, this.guild.id, userId);
    logger.debug(voiceParam);

    if (!voiceParam) {
      logger.warn("音声合成システムが無効です");

      const embed = createEmbedBase().setDescription("⚠ 音声合成システムが無効となっています");
      void this.textChannel.send(embed);
      return;
    }

    const fullParam: SpeechText = {
      speed: 1,
      volume: 1,
      ...param,
    };
    //ここでやらない方がいい気もする
    const config = getGuildConfig(this.guild.id);
    fullParam.speed *= config.masterSpeed;
    fullParam.volume *= config.masterVolume;

    void this.speechQueue.push({
      speechText: fullParam,
      voicearam: voiceParam,
    });

    this.lastPushedSpeech = {
      timestamp: timestamp ?? Date.now(),
      author: userId
        ? {
            type: "member",
           memberId: userId,
          }
        : {
           ype: "yosuga",
          },
    };

    // logger.debug(this.speechQueue);
  }

  changeTextChannel(textChannel: TextChannel): void {
    this.textChannel = textChannel;
  }

  getTextChannel(): Readonly<TextChannel> {
    return this.textChannel;
  }

  getUsernamePronunciation(member: GuildMember | null): string {
    return member?.displayName ?? "不明なユーザ";
  }
}

// const sessionStateMap: Record<string, Session> = {};
//
// export const getSession = (guildId: string): Session | null => {
//   if (guildId in sessionStateMap) {
//     return sessionStateMap[guildId];
//   } else {
//     return null;
//   }
// };
