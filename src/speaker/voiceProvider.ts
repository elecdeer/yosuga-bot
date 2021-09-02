import { AudioResource } from "@discordjs/voice";
import { Collection, Snowflake } from "discord.js";
import { getLogger } from "log4js";

import { Session } from "../session";
import { SpeechText, SpeakerOption } from "../types";
import { allSerial } from "../util";
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
    if (userId) {
      const userConfig = await configManager.getUserConfig(userId);
      if (this.isActiveSpeaker(collection, userConfig?.speakerOption?.speakerName)) {
        return userConfig!.speakerOption!;
      }
    }
    if (guildId) {
      const guildConfig = await configManager.getGuildConfig(guildId);
      if (this.isActiveSpeaker(collection, guildConfig?.speakerOption?.speakerName)) {
        return guildConfig!.speakerOption!;
      }
    }

    const masterConfig = await configManager.getMasterConfig();
    if (this.isActiveSpeaker(collection, masterConfig.speakerOption?.speakerName)) {
      return masterConfig.speakerOption;
    }
    return null;
  }

  isActiveSpeaker(
    speakerCollection: Collection<string, Speaker>,
    speakerName: string | undefined
  ): boolean {
    if (!speakerName) return false;
    const speaker = speakerCollection.get(speakerName);
    return speaker?.status === "active";
  }

  async synthesis(speechText: SpeechText, voiceOption: SpeakerOption): Promise<AudioResource> {
    const collection = await this.speakerCollection;
    const activeSpeakerCollection = collection.filter((value) => value.status == "active");

    const speaker = activeSpeakerCollection.get(voiceOption.speakerName);
    if (!speaker) throw new Error("使用できない話者名が指定されています");
    const result = await speaker.synthesis(speechText, voiceOption.voiceParam);
    if (!result) {
      throw new Error("合成に失敗");
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
