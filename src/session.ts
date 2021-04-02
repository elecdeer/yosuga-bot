import { Guild, GuildMember, TextChannel, VoiceChannel, VoiceConnection } from "discord.js";
import async, { QueueObject } from "async";
import { client } from "./index";
import { createEmbedBase, logger } from "./commands/commands";
import { Speaker, SpeechParam } from "./speaker/speaker";
import { getGuildConfig } from "./guildConfig";
import { VoiceroidSpeaker } from "./speaker/voiceroidSpeaker";

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
  speechQueue: QueueObject<SpeechParam>;
  guild: Guild;

  //仮
  speaker: Speaker;

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

    this.speaker = new VoiceroidSpeaker();

    sessionStateMap[guild.id] = this;
  }

  initializeQueue(): void {
    this.speechQueue.kill();
    this.speechQueue = this.createQueue();
  }

  private createQueue() {
    //tsだと変換されるからなのか、async functionだとうまく動かない

    return async.queue((param: SpeechParam, cb) => {
      // logger.debug("consume queue");
      // logger.debug(param);

      const config = getGuildConfig(this.guild.id);
      const connectedParam: SpeechParam = {
        Text: param.Text,
        Kana: param.Kana,
        Speaker: { ...config.defaultSpeakerParam, ...param.Speaker },
      };

      this.broadcastSpeech(connectedParam)
        .then(() => {
          cb();
        })
        .catch((err) => {
          cb(err);
        });
    });
  }

  broadcastSpeech(param: SpeechParam): Promise<void> {
    const connection = this.connection;
    if (!connection) {
      logger.error("broadcastSpeechを呼ぶ前にconnectVoiceChannelを呼ぶ必要がある");
      return Promise.reject();
    }

    return this.speaker
      .getSpeech(param)
      .then(
        (data) =>
          new Promise<void>((resolve) => {
            connection.play(data).once("finish", () => {
              logger.debug("resolve");
              resolve();
            });
          })
      )
      .catch((reason) => {
        logger.error(reason);
      });
  }

  async connectVoiceChannel(): Promise<void> {
    this.connection = await this.voiceChannel.join();

    await this.speaker.test().catch((err) => {
      logger.warn("音声合成システムが無効です");
      logger.warn(err);

      const embed = createEmbedBase().setDescription("⚠ 音声合成システムが無効となっています");
      void this.textChannel.send(embed);
    });
  }

  disconnect(): void {
    logger.info(`disconnect: ${this.voiceChannel.id}`);
    this.connection?.disconnect();
    this.speechQueue.kill();
    delete sessionStateMap[this.guild.id];
  }

  pushSpeech(param: SpeechParam, timestamp?: number, authorId?: string): void {
    // logger.debug("push speeech queue", param.Text);
    void this.speechQueue.push(param);

    this.lastMessageTimestamp = timestamp ?? Date.now();
    this.lastMessageAuthorId = authorId ?? client.user?.id ?? "unknown";

    // logger.debug(this.speechQueue);
  }

  getUsernamePronunciation(member: GuildMember | null): string {
    return member?.displayName ?? "不明なユーザ";
  }
}
