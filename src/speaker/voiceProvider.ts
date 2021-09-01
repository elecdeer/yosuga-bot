import { AudioResource } from "@discordjs/voice";
import { Collection, Snowflake } from "discord.js";

import { Session } from "../session";
import { SpeechText, SpeakerOption } from "../types";
import { Speaker } from "./speaker";

export type DaemonSpeakerBuildOption = {
  type: "voiceroidDaemon";
  urlBase: string;
};
export type TtsSpeakerBuildOption = {
  type: "ttsController";
  urlBase: string;
  wsUrl: string;
  outputDevice: string;
  voiceName: string;
};
export type SpeakerBuildOption = DaemonSpeakerBuildOption | TtsSpeakerBuildOption;

export class VoiceProvider {
  protected session: Session;
  speakerCollection: Collection<string, Speaker>;

  constructor(session: Session, speakerCollection: Collection<string, Speaker>) {
    this.session = session;
    this.speakerCollection = speakerCollection;
  }

  async getValidVoiceOption(
    guildId?: Snowflake,
    userId?: Snowflake
  ): Promise<SpeakerOption | null> {
    const configManager = this.session.yosuga.configManager;
    if (userId) {
      const userConfig = await configManager.getUserConfig(userId);
      if (this.isActiveSpeaker(userConfig?.speakerOption?.speakerName)) {
        return userConfig!.speakerOption!;
      }
    }
    if (guildId) {
      const guildConfig = await configManager.getGuildConfig(guildId);
      if (this.isActiveSpeaker(guildConfig?.speakerOption?.speakerName)) {
        return guildConfig!.speakerOption!;
      }
    }

    const masterConfig = await configManager.getMasterConfig();
    if (this.isActiveSpeaker(masterConfig.speakerOption?.speakerName)) {
      return masterConfig.speakerOption;
    }
    return null;
  }

  isActiveSpeaker(speakerName: string | undefined): boolean {
    if (!speakerName) return false;
    const speaker = this.speakerCollection.get(speakerName);
    return speaker?.status === "active";
  }

  async synthesis(speechText: SpeechText, voiceOption: SpeakerOption): Promise<AudioResource> {
    const activeSpeakerCollection = this.speakerCollection.filter(
      (value) => value.status == "active"
    );

    const speaker = activeSpeakerCollection.get(voiceOption.speakerName);
    if (!speaker) throw new Error("使用できない話者名が指定されています");
    const result = await speaker.synthesis(speechText, voiceOption.voiceParam);
    if (!result) {
      throw new Error("合成に失敗");
    }
    return result;
  }
}
