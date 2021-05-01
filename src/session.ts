import { SessionEmitter } from "./sessionEmitter";
import { GuildMember, TextChannel, VoiceConnection } from "discord.js";
import { createSpeechQueue, SpeechQueue } from "./speechQueue";
import { createSpeakerMap, SpeakerMap } from "./speaker/speakersBuilder";
import { YosugaEventEmitter } from "./yosugaEventEmitter";
import { getLogger } from "log4js";
import { PartiallyPartial, SessionEventHandlerRegistrant, SpeechText } from "./types";
import { getGuildConfig, getVoiceConfig, GuildConfigWithoutVoice } from "./configManager";
import { createEmbedBase } from "./util";
import { registerEnterRoom } from "./sessionHandler/speechEnterRoom";
import { registerMessageHandler } from "./sessionHandler/message";
import { registerLeaveRoom } from "./sessionHandler/speechLeaveRoom";
import { registerTurnOnVideo } from "./sessionHandler/speechTurnOnVideo";
import { registerTurnOnGoLive } from "./sessionHandler/speechTurnOnGoLive";
import { registerAutoLeave } from "./sessionHandler/autoLeave";

const logger = getLogger("session");

type SpeechRecordAuthorMember = {
  type: "member";
  memberId: string;
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
  protected textChannel: TextChannel;
  readonly connection: VoiceConnection;
  protected readonly speakerMap: SpeakerMap;
  protected speechQueue: SpeechQueue;

  lastPushedSpeech: PushSpeechRecord;

  constructor(
    yosugaEmitter: YosugaEventEmitter,
    connection: VoiceConnection,
    textChannel: TextChannel
  ) {
    super(yosugaEmitter, connection.channel);
    this.textChannel = textChannel;
    this.connection = connection;

    this.speakerMap = createSpeakerMap(this.guild.id);
    this.speechQueue = this.initializeQueue();

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
    this.speechQueue = createSpeechQueue(this.guild.id, this.speakerMap, this.connection);
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
      voiceParam: voiceParam,
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

  getConfig(): Readonly<GuildConfigWithoutVoice> {
    return getGuildConfig(this.guild.id);
  }

  getUsernamePronunciation(member: GuildMember | null): string {
    return member?.displayName ?? "不明なユーザ";
  }
}
