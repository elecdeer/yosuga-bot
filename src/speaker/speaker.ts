import { PauseParam, SpeechText, VoiceParam } from "../types";
import { AudioResource } from "@discordjs/voice";
import { Session } from "../session";

export type SpeakerState = "active" | "pendingInactive" | "inactive" | "checking";

export abstract class Speaker<T = unknown> {
  protected readonly session: Session;

  readonly engineType: string;
  status: SpeakerState = "checking";

  protected constructor(session: Session, engineType: string) {
    this.session = session;
    this.engineType = engineType;
  }

  async initialize(): Promise<Speaker<T>> {
    this.status = await this.checkInitialActiveness();
    return this;
  }

  abstract synthesis(
    speechText: SpeechText,
    voiceParam: VoiceParam<T>,
    pauseParam: PauseParam
  ): Promise<AudioResource>;

  protected abstract checkInitialActiveness(): Promise<SpeakerState>;
}
