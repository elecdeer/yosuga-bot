import { AudioResource } from "@discordjs/voice";
import { Collection } from "discord.js";
import { getLogger } from "log4js";

import { Session } from "../session";
import { SpeakerOption, SpeechText } from "../types";
import { Deferred } from "../util/deferred";
import { allSerial } from "../util/promiseUtil";
import { failure, Result } from "../util/result";
import { GuildId, UserId } from "../util/types";
import { Speaker } from "./speaker";
import { TtsControllerSpeaker, TtsSpeakerBuildOption } from "./ttsControllerSpeaker";
import { DaemonSpeakerBuildOption, VoiceroidDaemonSpeaker } from "./voiceroidDaemonSpeaker";

export type SpeakerBuildOption = DaemonSpeakerBuildOption | TtsSpeakerBuildOption;

const logger = getLogger("voiceProvider");

export class VoiceProvider {
  protected session: Session;
  protected readonly speakerCollection: Promise<Collection<string, Speaker>>;
  protected readonly speakerCollectionAllLoaded: Promise<Collection<string, Speaker>>;

  constructor(session: Session) {
    this.session = session;
    const constructed = constructSpeakerCollection(session);
    this.speakerCollection = constructed.minimum;
    this.speakerCollectionAllLoaded = constructed.all;
  }

  async getValidVoiceOption(guildId?: GuildId, userId?: UserId): Promise<SpeakerOption | null> {
    const configManager = this.session.yosuga.configManager;
    const collection = await this.speakerCollection;
    const accessor = configManager.getValidVoiceConfigAccessor(collection, guildId, userId);

    return (await accessor.get("speakerOption")) ?? null;
  }

  async synthesis(
    speechText: SpeechText,
    voiceOption: SpeakerOption
  ): Promise<Result<AudioResource, Error>> {
    const collection = await this.speakerCollection;
    const activeSpeakerCollection = collection.filter((value) => value.status == "active");

    const speaker = activeSpeakerCollection.get(voiceOption.speakerName);
    if (!speaker) throw new Error("使用できない話者名が指定されています");
    const result = await speaker.synthesis(speechText, voiceOption.voiceParam);
    if (result.isFailure()) {
      logger.error(result.value);
      return failure(new Error("合成に失敗"));
    }

    return result;
  }

  async getSpeakersStatus(waitAllLoaded?: boolean): Promise<{ name: string; status: string }[]> {
    const collection = waitAllLoaded
      ? await this.speakerCollectionAllLoaded
      : await this.speakerCollection;
    return collection.map((speaker, key) => {
      return {
        name: `${key} [${speaker.engineType}]`,
        status: speaker.status,
      };
    });
  }
}

const constructSpeakerCollection = (
  session: Session
): {
  minimum: Promise<Collection<string, Speaker>>;
  all: Promise<Collection<string, Speaker>>;
} => {
  const minimum = new Deferred<Collection<string, Speaker>>();
  const all = new Deferred<Collection<string, Speaker>>();

  void (async () => {
    const collection = new Collection<string, Speaker>();

    const config = await session.getConfig();
    logger.debug("constructSpeakerCollection");
    logger.debug(config.speakerBuildOptions);

    Object.values(config.speakerBuildOptions).forEach((speakerOption) => {
      if (speakerOption.type === "voiceroidDaemon") {
        collection.set(speakerOption.voiceName, new VoiceroidDaemonSpeaker(session, speakerOption));
        return;
      }
      if (speakerOption.type === "ttsController") {
        collection.set(speakerOption.voiceName, new TtsControllerSpeaker(session, speakerOption));
        return;
      }
    });

    const initializeTask = async (speaker: Speaker) => {
      await speaker.initialize();
      if (speaker.status === "active") {
        minimum.resolve(collection);
      }
    };

    await allSerial(collection.map((speaker) => () => initializeTask(speaker)));

    logger.debug(collection);
    all.resolve(collection);
    // collection.some(speaker => speaker.status === "active");
  })();

  return {
    minimum: minimum.promise,
    all: all.promise,
  };
};
