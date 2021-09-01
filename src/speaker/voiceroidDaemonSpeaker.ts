import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import axios from "axios";
import { getLogger } from "log4js";
import { Readable } from "stream";

import { Session } from "../session";
import { SpeechText, VoiceParam } from "../types";
import { Speaker, SpeakerState } from "./speaker";

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

export class VoiceroidDaemonSpeaker extends Speaker<Record<string, never>> {
  protected urlBase: string;
  private checkUrl: string;
  private speechTextUrl: string;

  constructor(session: Session, urlBase: string) {
    super(session, "voiceroidDaemon");
    this.urlBase = urlBase;
    this.checkUrl = `${urlBase}/`;
    this.speechTextUrl = `${urlBase}/api/speechtext`;
  }

  override async synthesis(
    speechText: SpeechText,
    voiceParam: VoiceParam<Record<string, never>>
  ): Promise<AudioResource | null> {
    const query: VoiceroidDaemonQuery = {
      Text: speechText.text,
      Speaker: {
        Volume: speechText.volume,
        Speed: speechText.speed,
        Pitch: voiceParam.pitch,
        Emphasis: voiceParam.intonation,
      },
    };

    const res = await axios.post<Readable>(this.speechTextUrl, query, {
      responseType: "stream",
    });

    if (res.status === 200) {
      return createAudioResource(res.data, {
        inputType: StreamType.Arbitrary,
      });
    }

    return null;
  }

  override async checkInitialActiveness(): Promise<SpeakerState> {
    logger.debug("checkInitialActiveness");

    try {
      await axios({
        method: "GET",
        url: this.checkUrl,
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
