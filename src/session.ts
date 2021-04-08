import { Guild, GuildMember, TextChannel, VoiceChannel, VoiceConnection } from "discord.js";
import async, { QueueObject } from "async";
import { PauseParam, Speaker, SpeechTask, SpeechText } from "./types";
import { getGuildConfig } from "./guildConfig";
import { createEmbedBase, logger } from "./commands/commands";
import { client } from "./index";
import { VoiceroidSpeaker } from "./speaker/voiceroidSpeaker";
import { AIVoiceSpeaker } from "./speaker/aivoiceSpeaker";

const sessionStateMap: Record<string, Session> = {};

export const getSession = (guildId: string): Session | null => {
  if (guildId in sessionStateMap) {
    return sessionStateMap[guildId];
  } else {
    return null;
  }
};

const defaultPauseParam: PauseParam = {
  shortPause: 150,
  longPause: 370,
  sentencePause: 800,
};

export class Session {
  connection: VoiceConnection | null;
  voiceChannel: VoiceChannel;
  textChannel: TextChannel;
  speechQueue: QueueObject<SpeechTask>;
  guild: Guild;

  //仮
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  speaker: Speaker<any>;

  lastMessageTimestamp: number;
  lastMessageAuthorId: string;

  constructor(voiceChannel: VoiceChannel, textChannel: TextChannel, guild: Guild) {
    this.connection = null;
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.guild = guild;

    this.speechQueue = this.createQueue();

    this.lastMessageTimestamp = 0;
    this.lastMessageAuthorId = "";

    this.speaker = new AIVoiceSpeaker();

    sessionStateMap[guild.id] = this;
  }

  initializeQueue(): void {
    this.speechQueue.kill();
    this.speechQueue = this.createQueue();
  }

  private createQueue() {
    const worker = async (task: SpeechTask): Promise<void> => {
      const config = getGuildConfig(this.guild.id);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const query = this.speaker.constructSynthesisQuery(
        task.speechText,
        task.voiceParam,
        defaultPauseParam
      );

      const result = await this.speaker.synthesisSpeech(query);

      const connection = this.connection;
      if (!connection) {
        logger.error("broadcastSpeechを呼ぶ前にconnectVoiceChannelを呼ぶ必要がある");
        return Promise.reject();
      }

      await new Promise<void>((resolve) => {
        const dispatcher = connection.play(result.stream, {
          type: result.type ?? "unknown",
        });

        dispatcher.once("finish", () => {
          logger.debug("resolve");
          resolve();
        });
      });
    };

    return async.queue<SpeechTask, Error>((task, callback) => {
      worker(task)
        .then(() => {
          callback(null);
        })
        .catch((err) => {
          callback(err);
        });
    });
  }

  async connectVoiceChannel(): Promise<void> {
    this.connection = await this.voiceChannel.join();

    const isEnable = await this.speaker.checkIsEnableSynthesizer();
    if (!isEnable) {
      logger.warn("音声合成システムが無効です");

      const embed = createEmbedBase().setDescription("⚠ 音声合成システムが無効となっています");
      void this.textChannel.send(embed);
    }
  }

  disconnect(): void {
    logger.info(`disconnect: ${this.voiceChannel.id}`);
    this.connection?.disconnect();
    this.speechQueue.kill();
    delete sessionStateMap[this.guild.id];
  }

  pushSpeech(param: SpeechText, timestamp?: number, authorId?: string): void {
    // logger.debug("push speeech queue", param.Text);

    //仮
    void this.speechQueue.push({
      speechText: param,
      voiceParam: {
        pitch: 1,
        intonation: 1,
        additionalOption: {
          cid: 5203,
          emotionHappy: 0.5,
          emotionAngry: 0,
          emotionSad: 0,
        },
      },
    });

    this.lastMessageTimestamp = timestamp ?? Date.now();
    this.lastMessageAuthorId = authorId ?? client.user?.id ?? "unknown";

    // logger.debug(this.speechQueue);
  }

  getUsernamePronunciation(member: GuildMember | null): string {
    return member?.displayName ?? "不明なユーザ";
  }
}
