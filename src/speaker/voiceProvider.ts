import { AudioResource } from "@discordjs/voice";
import { PauseParam, SpeechText, VoiceOption } from "../types";
import { Collection } from "discord.js";
import { Speaker } from "./speaker";
import { Session } from "../session";

export class VoiceProvider {
  protected session: Session;
  speakerCollection: Collection<string, Speaker>;

  constructor(session: Session, speakerCollection: Collection<string, Speaker>) {
    this.session = session;
    this.speakerCollection = speakerCollection;
  }

  synthesis(
    speechText: SpeechText,
    voiceOption: VoiceOption,
    pauseParam: PauseParam
  ): Promise<AudioResource> {
    const activeSpeakerCollection = this.speakerCollection.filter(
      (value) => value.status == "active"
    );

    const speaker = activeSpeakerCollection.get(voiceOption.speakerName);
    if (!speaker) throw new Error("使用できない話者名が指定されています");
    return speaker.synthesis(speechText, voiceOption.voiceParam, pauseParam);
  }
}
