import { AudioResource } from "@discordjs/voice";
import { Collection } from "discord.js";

import { Session } from "../session";
import { PauseParam, SpeechText, VoiceOption } from "../types";
import { Speaker } from "./speaker";

export class VoiceProvider {
  protected session: Session;
  speakerCollection: Collection<string, Speaker>;

  constructor(session: Session, speakerCollection: Collection<string, Speaker>) {
    this.session = session;
    this.speakerCollection = speakerCollection;
  }

  async synthesis(
    speechText: SpeechText,
    voiceOption: VoiceOption,
    pauseParam: PauseParam
  ): Promise<AudioResource> {
    const activeSpeakerCollection = this.speakerCollection.filter(
      (value) => value.status == "active"
    );

    const speaker = activeSpeakerCollection.get(voiceOption.speakerName);
    if (!speaker) throw new Error("使用できない話者名が指定されています");
    const result = await speaker.synthesis(speechText, voiceOption.voiceParam, pauseParam);
    if (!result) {
      throw new Error("合成に失敗");
    }
    return result;
  }
}
