import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import axios from "axios";
import { getLogger } from "log4js";
import { Readable } from "stream";

import { Session } from "../session";
import { SpeechText, VoiceParam } from "../types";
import { failure, Result, success } from "../util/result";
import { Speaker, SpeakerState } from "./speaker";

export type DaemonSpeakerBuildOption = {
  type: "voiceroidDaemon";
  urlBase: string;
};

export type VoiceroidDaemonQuery = Partial<{
  Text: string;
  Kana: string;
  Speaker: VoiceroidDaemonSpeakerParam;
}>;
export type VoiceroidDaemonSpeakerParam = Partial<{
  Volume: number;
  Speed: number;
  Pitch: number;
  Emphasis: number;
  PauseMiddle: number;
  PauseLong: number;
  PauseSentence: number;
}>;

const logger = getLogger("voiceroidDaemonSpeaker");

const TIMEOUT_MS = 3000;

export class VoiceroidDaemonSpeaker extends Speaker<Record<string, never>> {
  protected urlBase: string;
  private checkUrl: string;
  private speechTextUrl: string;

  constructor(session: Session, option: DaemonSpeakerBuildOption) {
    super(session, "voiceroidDaemon");
    this.urlBase = option.urlBase;
    this.checkUrl = option.urlBase;

    this.speechTextUrl = new URL("/api/speechtext", option.urlBase).href;
  }

  override async synthesis(
    speechText: SpeechText,
    voiceParam: VoiceParam<Record<string, never>>
  ): Promise<Result<AudioResource, Error>> {
    const query: VoiceroidDaemonQuery = {
      Text: speechText.text,
      Speaker: {
        Volume: speechText.volume,
        Speed: speechText.speed,
        Pitch: voiceParam.pitch,
        Emphasis: voiceParam.intonation,
      },
    };

    try {
      const res = await axios.post<Readable>(this.speechTextUrl, query, {
        responseType: "stream",
        timeout: TIMEOUT_MS,
      });

      if (res.status === 200) {
        const resource = createAudioResource(res.data, {
          inputType: StreamType.Arbitrary,
        });

        return success(resource);
      }
    } catch (e) {
      logger.error(e);
      return failure(new Error("synthesis request failed"));
    }
    return failure(new Error("synthesis request failed"));
  }

  override async checkInitialActiveness(): Promise<SpeakerState> {
    logger.debug("checkInitialActiveness");

    try {
      await axios.get(this.checkUrl, {
        timeout: TIMEOUT_MS,
      });

      logger.debug(`${this.urlBase} active`);
      return "active";
    } catch (error) {
      logger.debug(`${this.urlBase} inactive`);
      logger.debug(error);
      return "inactive";
    }
  }
}
