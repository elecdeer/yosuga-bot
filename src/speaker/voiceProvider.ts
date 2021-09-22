import { AudioResource } from "@discordjs/voice";
import { Collection, Snowflake } from "discord.js";
import { getLogger } from "log4js";

import { Session } from "../session";
import { SpeakerOption, SpeechText } from "../types";
import { failure, Result } from "../util/result";
import { allSerial } from "../util/util";
import { Speaker } from "./speaker";
import { TtsControllerSpeaker, TtsSpeakerBuildOption } from "./ttsControllerSpeaker";
import { DaemonSpeakerBuildOption, VoiceroidDaemonSpeaker } from "./voiceroidDaemonSpeaker";

export type SpeakerBuildOption = DaemonSpeakerBuildOption | TtsSpeakerBuildOption;

const logger = getLogger("voiceProvider");

export class VoiceProvider {
  protected session: Session;
  protected speakerCollection: Promise<Collection<string, Speaker>>;

  constructor(session: Session) {
    this.session = session;
    this.speakerCollection = constructSpeakerCollection(session);
  }

  async getValidVoiceOption(
    guildId?: Snowflake,
    userId?: Snowflake
  ): Promise<SpeakerOption | null> {
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

  async getSpeakersStatus(): Promise<{ name: string; status: string }[]> {
    const collection = await this.speakerCollection;
    return collection.map((speaker, key) => {
      return {
        name: `${key} [${speaker.engineType}]`,
        status: speaker.status,
      };
    });
  }
}

const constructSpeakerCollection = async (
  session: Session
): Promise<Collection<string, Speaker>> => {
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

  await allSerial(collection.map((speaker) => () => speaker.initialize()));
  logger.debug(collection);
  return collection;
};
