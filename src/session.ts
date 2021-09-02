import {
  AudioPlayer,
  createAudioPlayer,
  NoSubscriberBehavior,
  VoiceConnection,
} from "@discordjs/voice";
import { GuildMember, Snowflake, TextChannel } from "discord.js";
import { getLogger } from "log4js";
import { SetOptional } from "type-fest";

import { UnifiedConfig } from "./configManager";
import { yosuga } from "./index";
import { SessionEmitter } from "./sessionEmitter";
import { registerAutoLeave } from "./sessionHandler/autoLeave";
import { registerMessageHandler } from "./sessionHandler/message";
import { registerEnterRoom } from "./sessionHandler/speechEnterRoom";
import { registerLeaveRoom } from "./sessionHandler/speechLeaveRoom";
import { registerTurnOnGoLive } from "./sessionHandler/speechTurnOnGoLive";
import { registerTurnOnVideo } from "./sessionHandler/speechTurnOnVideo";
import { VoiceProvider } from "./speaker/voiceProvider";
import { createSpeechQueue, SpeechQueue } from "./speechQueue";
import { SessionEventHandlerRegistrant, SpeechText, VoiceOrStageChannel } from "./types";
import { createYosugaEmbed } from "./util";
import { YosugaClient } from "./yosugaClient";

const logger = getLogger("session");

type SpeechRecordAuthorMember = {
  type: "member";
  memberId: Snowflake;
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

const handlerRegistrants: SessionEventHandlerRegistrant[] = [
  registerMessageHandler,
  registerEnterRoom,
  registerLeaveRoom,
  registerTurnOnVideo,
  registerTurnOnGoLive,
  registerAutoLeave,
];

export class Session extends SessionEmitter {
  connection: VoiceConnection;
  // protected readonly speakerMap: SpeakerMap;

  //TODO これまとめたさがある
  protected voiceProvider: VoiceProvider;
  protected speechQueue: SpeechQueue;
  readonly player: AudioPlayer;

  lastPushedSpeech: PushSpeechRecord;

  constructor(
    yosuga: YosugaClient,
    connection: VoiceConnection,
    textChannel: TextChannel,
    voiceChannel: VoiceOrStageChannel
  ) {
    super(yosuga, voiceChannel, textChannel);
    this.connection = connection;
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

    handlerRegistrants.forEach((registrant) => {
      void registrant(this);
    });
  }

  initializeQueue(): SpeechQueue {
    this.speechQueue?.kill();
    this.speechQueue = createSpeechQueue(this);
    return this.speechQueue;
  }

  disconnect(): void {
    logger.info(`disconnect: ${this.voiceChannel.id}`);
    this.connection.disconnect();
    this.speechQueue.kill();
    this.emit("disconnect");
    this.removeAllListeners();
  }

  async pushSpeech(
    param: SetOptional<SpeechText, "speed" | "volume">,
    userId?: Snowflake,
    timestamp?: number
  ): Promise<void> {
    // logger.debug("push speeech queue", param.Text);

    // logger.debug(this.speakerMap);

    //check状態のことを考えるべきかも

    const voiceOption = await this.voiceProvider.getValidVoiceOption(this.guild.id, userId);
    logger.debug(voiceOption);

    if (!voiceOption) {
      logger.warn("音声合成システムが無効です");

      const embed = createYosugaEmbed().setDescription("⚠ 音声合成システムが無効となっています");
      await this.textChannel.send({ embeds: [embed] });
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
    this.connection = connection;
  }

  getTextChannel(): Readonly<TextChannel> {
    return this.textChannel;
  }

  getVoiceChannel(): Readonly<VoiceOrStageChannel> {
    return this.voiceChannel;
  }

  async getConfig(): Promise<Readonly<UnifiedConfig>> {
    return await this.yosuga.configManager.getUnifiedConfig(this.guild.id);
  }

  getGuildId(): Snowflake {
    return this.guild.id;
  }

  getVoiceProvider(): Readonly<VoiceProvider> {
    return this.voiceProvider;
  }

  getYosugaUserId(): Snowflake {
    return this.guild.me!.id;
  }

  getUsernamePronunciation(member: GuildMember | null): string {
    return member?.displayName ?? "不明なユーザ";
  }
}
