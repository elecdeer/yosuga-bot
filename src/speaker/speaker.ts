import { getLogger } from "log4js";

import type { Session } from "../session";
import type { AdditionalVoiceParam, SpeechText, VoiceParam } from "../types";
import type { Result } from "../util/result";
import type { AudioResource } from "@discordjs/voice";

export type SpeakerState = "active" | "pendingInactive" | "inactive" | "checking";

const logger = getLogger("speakerLogger");

/**
 * Sessionごとに生成される音声合成用インタフェース
 */
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
