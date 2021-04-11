import { Guild, GuildMember, TextChannel, VoiceChannel, VoiceConnection } from "discord.js";
import async, { QueueObject } from "async";
import { PartiallyPartial, SpeechTask, SpeechText, VoiceParamBind } from "./types";
import { getGuildConfig, getVoiceConfig } from "./configManager";
import { createEmbedBase } from "./commands/commands";
import { client } from "./index";
import { createSpeakerMap, disposeSpeakerMap, SpeakerMap } from "./speaker/speakersBuilder";
import { getLogger } from "log4js";

const logger = getLogger("session");

const sessionStateMap: Record<string, Session> = {};

export const getSession = (guildId: string): Session | null => {
  if (guildId in sessionStateMap) {
    return sessionStateMap[guildId];
  } else {
    return null;
  }
};

export class Session {
  connection: VoiceConnection | null;
  voiceChannel: VoiceChannel;
  textChannel: TextChannel;
  speechQueue: QueueObject<SpeechTask>;
  guild: Guild;

  speakerMap: SpeakerMap;

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

    this.speakerMap = createSpeakerMap(guild.id);

    sessionStateMap[guild.id] = this;
  }

  initializeQueue(): void {
    this.speechQueue.kill();
    this.speechQueue = this.createQueue();
  }

  private createQueue() {
    const worker = async (task: SpeechTask): Promise<void> => {
      const config = getGuildConfig(this.guild.id);

      const speakerValue = this.speakerMap[task.voiceParam.speakerOption.speaker];
      if (speakerValue.status !== "active") {
        return;
      }

      //敗北のany
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const voiceParam: VoiceParamBind<any> = task.voiceParam;

      const query = speakerValue.speaker.constructSynthesisQuery(
        task.speechText,
        voiceParam,
        config.pauseParam
      );

      logger.debug("query", query);

      const result = await speakerValue.speaker.synthesisSpeech(query);

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
  }

  disconnect(): void {
    logger.info(`disconnect: ${this.voiceChannel.id}`);
    this.connection?.disconnect();
    this.speechQueue.kill();
    disposeSpeakerMap(this.guild.id);
    delete sessionStateMap[this.guild.id];
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

    this.lastMessageTimestamp = timestamp ?? Date.now();
    this.lastMessageAuthorId = userId ?? client.user?.id ?? "unknown";

    // logger.debug(this.speechQueue);
  }

  getUsernamePronunciation(member: GuildMember | null): string {
    return member?.displayName ?? "不明なユーザ";
  }
}
