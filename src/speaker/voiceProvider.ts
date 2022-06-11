import { Collection } from "discord.js";
import { getLogger } from "log4js";

import { Deferred } from "../util/deferred";
import { allSerial } from "../util/promiseUtil";
import { failure } from "../util/result";
import { TtsControllerSpeaker } from "./ttsControllerSpeaker";
import { VoiceroidDaemonSpeaker } from "./voiceroidDaemonSpeaker";
import { VoicevoxSpeaker } from "./voicevoxSpeaker";

import type { Session } from "../session";
import type { GuildId, SpeakerOption, SpeechText, UserId } from "../types";
import type { Result } from "../util/result";
import type { Speaker } from "./speaker";
import type { TtsSpeakerBuildOption } from "./ttsControllerSpeaker";
import type { DaemonSpeakerBuildOption } from "./voiceroidDaemonSpeaker";
import type { VoicevoxSpeakerBuildOption } from "./voicevoxSpeaker";
import type { AudioResource } from "@discordjs/voice";

export type SpeakerBuildOption = {
  voiceName: string;
} & (DaemonSpeakerBuildOption | TtsSpeakerBuildOption | VoicevoxSpeakerBuildOption);

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

    const name = await accessor.get("speakerName");
    if (name === undefined) {
      return null;
    }
    return {
      speakerName: name,
      voiceParam: {
        pitch: await accessor.get("speakerPitch"),
        intonation: await accessor.get("speakerIntonation"),
      },
    };
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

  async getSpeakersStatus(waitAllLoaded = false): Promise<{ name: string; status: string }[]> {
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

    const speakers = Object.values(config.speakerBuildOptions);
    if (speakers.length < 1) {
      minimum.resolve(collection);
      all.resolve(collection);
      return;
    }

    speakers.forEach((speakerOption) => {
      collection.set(speakerOption.voiceName, createSpeaker(speakerOption, session));
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

const createSpeaker = (speakerOption: SpeakerBuildOption, session: Session) => {
  switch (speakerOption.type) {
    case "voiceroidDaemon":
      return new VoiceroidDaemonSpeaker(session, speakerOption);
    case "ttsController":
      return new TtsControllerSpeaker(session, speakerOption);
    case "voicevox":
      return new VoicevoxSpeaker(session, speakerOption);
  }
};
