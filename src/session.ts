import {
  AudioPlayer,
  createAudioPlayer,
  NoSubscriberBehavior,
  VoiceConnection,
} from "@discordjs/voice";
import { Guild, GuildMember, TextChannel } from "discord.js";
import { getLogger } from "log4js";
import { SetOptional } from "type-fest";

import { UnifiedConfig } from "./config/typesConfig";
import { hookSessionHandlers, loadSessionHandlers } from "./handler/sessionHandlerLoader";
import { VoiceProvider } from "./speaker/voiceProvider";
import { createSpeechQueue, SpeechQueue } from "./speechQueue";
import { SpeechText, UserId, VoiceOrStageChannel } from "./types";
import { constructEmbeds } from "./util/createEmbed";
import { YosugaClient } from "./yosugaClient";

const logger = getLogger("session");

type SpeechRecordAuthorMember = {
  type: "member";
  memberId: UserId;
};
type SpeechRecordAuthorSystem = {
  type: "yosuga";
};
type SpeechRecordAuthorOther = {
  type: "unknown";
};
type SpeechRecordAuthor =
  | SpeechRecordAuthorMember
  | SpeechRecordAuthorSystem
  | SpeechRecordAuthorOther;
type PushSpeechRecord = {
  timestamp: number;
  author: SpeechRecordAuthor;
};

export class Session {
  readonly yosuga: YosugaClient;
  private _voiceChannel: VoiceOrStageChannel;
  private _textChannel: TextChannel;

  private _voiceConnection: VoiceConnection;

  //TODO これまとめたさがある
  public readonly voiceProvider: VoiceProvider;
  public readonly player: AudioPlayer;
  protected speechQueue: SpeechQueue;

  lastPushedSpeech: PushSpeechRecord;

  constructor(
    yosuga: YosugaClient,
    connection: VoiceConnection,
    textChannel: TextChannel,
    voiceChannel: VoiceOrStageChannel
  ) {
    this.yosuga = yosuga;
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;

    this._voiceConnection = connection;
    this.speechQueue = this.initializeQueue();
    this.voiceProvider = new VoiceProvider(this);

    this.player = createAudioPlayer({
      debug: true,
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });
    connection.subscribe(this.player);

    this.lastPushedSpeech = {
      timestamp: 0,
      author: {
        type: "unknown",
      },
    };

    const handlers = loadSessionHandlers(yosuga.client, yosuga, this);
    hookSessionHandlers(handlers, yosuga.client);
  }

  initializeQueue(): SpeechQueue {
    this.speechQueue?.kill();
    this.speechQueue = createSpeechQueue(this);
    return this.speechQueue;
  }

  disconnect(): void {
    logger.info(`disconnect: ${this.voiceChannel.id}`);
    this.voiceConnection.disconnect();
    this.speechQueue.kill();
  }

  async pushSpeech(
    param: SetOptional<SpeechText, "speed" | "volume">,
    userId?: UserId,
    timestamp?: number
  ): Promise<void> {
    //全員botなら読み上げない
    if (this.voiceChannel.members.every((mem) => mem.user.bot)) {
      return;
    }

    const voiceOption = await this.voiceProvider.getValidVoiceOption(this.guild.id, userId);
    logger.debug(voiceOption);

    if (!voiceOption) {
      logger.warn("音声合成システムが無効です");

      const embeds = constructEmbeds("warn", "音声合成システムが無効となっています");
      await this.textChannel.send({ embeds: embeds });
      return;
    }

    const fullParam: SpeechText = {
      speed: 1,
      volume: 1,
      ...param,
    };
    //ここでやらない方がいい気もする
    const config = await this.getConfig();
    fullParam.speed *= config.masterSpeed;
    fullParam.volume *= config.masterVolume;

    void this.speechQueue.push({
      speechText: fullParam,
      voiceOption: voiceOption,
    });

    this.lastPushedSpeech = {
      timestamp: timestamp ?? Date.now(),
      author: userId
        ? {
            type: "member",
            memberId: userId,
          }
        : {
            type: "yosuga",
          },
    };

    // logger.debug(this.speechQueue);
  }

  changeTextChannel(textChannel: TextChannel): void {
    this.textChannel = textChannel;
  }

  changeVoiceChannel(voiceChannel: VoiceOrStageChannel, connection: VoiceConnection): void {
    this.voiceChannel = voiceChannel;
    this.voiceConnection = connection;
  }

  get voiceChannel(): VoiceOrStageChannel {
    return this._voiceChannel;
  }
  protected set voiceChannel(value: VoiceOrStageChannel) {
    this._voiceChannel = value;
  }

  get textChannel(): TextChannel {
    return this._textChannel;
  }
  protected set textChannel(value: TextChannel) {
    this._textChannel = value;
  }

  get voiceConnection(): VoiceConnection {
    return this._voiceConnection;
  }
  protected set voiceConnection(value: VoiceConnection) {
    this._voiceConnection = value;
  }

  get guild(): Guild {
    return this.voiceChannel.guild;
  }

  async getConfig(): Promise<Readonly<UnifiedConfig>> {
    return this.yosuga.configManager.getUnifiedConfigAccessor(this.guild.id).getAllValue();
  }

  getUsernamePronunciation(member: GuildMember | null): string {
    return member?.displayName ?? "不明なユーザ";
  }
}
