import { AudioResource } from "@discordjs/voice";
import { getLogger } from "log4js";

import { Session } from "../session";
import { AdditionalVoiceParam, SpeechText, VoiceParam } from "../types";
import { Result } from "../util/result";

export type SpeakerState = "active" | "pendingInactive" | "inactive" | "checking";

const logger = getLogger("speakerLogger");

export abstract class Speaker<T extends AdditionalVoiceParam = AdditionalVoiceParam> {
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
      this.status = "inactive";
      logger.error(e);
    }
    return this;
  }

  abstract synthesis(
    speechText: SpeechText,
    voiceParam: VoiceParam<T>
  ): Promise<Result<AudioResource, Error>>;

  protected abstract checkInitialActiveness(): Promise<SpeakerState>;
}
