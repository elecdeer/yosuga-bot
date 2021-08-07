import { PauseParam, SpeechText, VoiceParam } from "../types";
import { AudioResource } from "@discordjs/voice";

type SpeakerState = "active" | "pendingInactive" | "inactive" | "checking";

export abstract class Speaker<T = unknown> {
  status: SpeakerState = "checking";

  abstract synthesis(
    speechText: SpeechText,
    voiceParam: VoiceParam<T>,
    pauseParam: PauseParam
  ): Promise<AudioResource>;

  abstract checkInitialActiveness(): Promise<void>;

  dispose(): void {
    //  何かあれば
  }
}
