import { PauseParam, SpeechText, VoiceParam } from "../types";
import { AudioResource } from "@discordjs/voice";
import { Session } from "../session";
import { getLogger } from "log4js";

export type SpeakerState = "active" | "pendingInactive" | "inactive" | "checking";

const logger = getLogger("speakerLogger");

export abstract class Speaker<T = unknown> {
  protected readonly session: Session;

  readonly engineType: string;
  status: SpeakerState = "checking";

  protected constructor(session: Session, engineType: string) {
    this.session = session;
    this.engineType = engineType;
  }

  async initialize(): Promise<Speaker<T>> {
    try {
      this.status = await this.checkInitialActiveness();
    } catch (e) {
      logger.error(e);
    }
    return this;
  }

  abstract synthesis(
    speechText: SpeechText,
    voiceParam: VoiceParam<T>,
    pauseParam: PauseParam
  ): Promise<AudioResource | null>;

  protected abstract checkInitialActiveness(): Promise<SpeakerState>;
}
