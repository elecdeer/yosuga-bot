import { SessionEmitter } from "./sessionEmitter";
import { GuildMember, Snowflake, TextChannel } from "discord.js";
import { createSpeechQueue, SpeechQueue } from "./speechQueue";
import { YosugaEventEmitter } from "./yosugaEventEmitter";
import { getLogger } from "log4js";
import {
  PartiallyPartial,
  SessionEventHandlerRegistrant,
  SpeechText,
  VoiceOrStageChannel,
} from "./types";
import { getGuildConfig, getVoiceConfig, GuildConfigWithoutVoice } from "./configManager";
import { createYosugaEmbed } from "./util";
import { registerEnterRoom } from "./sessionHandler/speechEnterRoom";
import { registerMessageHandler } from "./sessionHandler/message";
import { registerLeaveRoom } from "./sessionHandler/speechLeaveRoom";
import { registerTurnOnVideo } from "./sessionHandler/speechTurnOnVideo";
import { registerTurnOnGoLive } from "./sessionHandler/speechTurnOnGoLive";
import { registerAutoLeave } from "./sessionHandler/autoLeave";
import {
  AudioPlayer,
  createAudioPlayer,
  NoSubscriberBehavior,
  VoiceConnection,
} from "@discordjs/voice";
import { VoiceProvider } from "./speaker/voiceProvider";
import { yosuga } from "./index";

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
  readonly connection: VoiceConnection;
  // protected readonly speakerMap: SpeakerMap;

  //TODO これまとめたさがある
  protected voiceProvider: VoiceProvider;
  protected speechQueue: SpeechQueue;
  readonly player: AudioPlayer;

  lastPushedSpeech: PushSpeechRecord;

  constructor(
    yosugaEmitter: YosugaEventEmitter,
    connection: VoiceConnection,
    textChannel: TextChannel,
    voiceChannel: VoiceOrStageChannel
  ) {
    super(yosugaEmitter, voiceChannel, textChannel);
    this.connection = connection;

    this.voiceProvider = new VoiceProvider(this, yosuga.speakersFactory(this));

    this.speechQueue = this.initializeQueue();

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
      registrant(this);
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

  pushSpeech(
    param: PartiallyPartial<SpeechText, "speed" | "volume">,
    userId?: Snowflake,
    timestamp?: number
  ): void {
    // logger.debug("push speeech queue", param.Text);

    // logger.debug(this.speakerMap);

    //check状態のことを考えるべきかも
    const voiceOption = getVoiceConfig(this.voiceProvider, this.guild.id, userId);
    logger.debug(voiceOption);

    if (!voiceOption) {
      logger.warn("音声合成システムが無効です");

      const embed = createYosugaEmbed().setDescription("⚠ 音声合成システムが無効となっています");
      void this.textChannel.send({ embeds: [embed] });
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

  getTextChannel(): Readonly<TextChannel> {
    return this.textChannel;
  }

  getVoiceChannel(): Readonly<VoiceOrStageChannel> {
    return this.voiceChannel;
  }

  getConfig(): Readonly<GuildConfigWithoutVoice> {
    return getGuildConfig(this.guild.id);
  }

  getGuildId(): Snowflake {
    return this.guild.id;
  }

  getVoiceProvider(): Readonly<VoiceProvider> {
    return this.voiceProvider;
  }

  getUsernamePronunciation(member: GuildMember | null): string {
    return member?.displayName ?? "不明なユーザ";
  }
}
