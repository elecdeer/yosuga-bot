import { PauseParam, SpeechText, VoiceParam } from "../types";
import { AudioResource } from "@discordjs/voice";
import { Session } from "../session";

type SpeakerState = "active" | "pendingInactive" | "inactive" | "checking";

export abstract class Speaker<T = unknown> {
  protected session: Session;
  status: SpeakerState = "checking";

  constructor(session: Session) {
    this.session = session;
  }

  abstract synthesis(
    speechText: SpeechText,
    voiceParam: VoiceParam<T>,
    pauseParam: PauseParam
  ): Promise<AudioResource>;

  abstract checkInitialActiveness(): Promise<void>;
}
