import { Speaker } from "./speaker";
import { PauseParam, SpeechText, VoiceParam } from "../types";
import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import axios from "axios";
import { Readable } from "stream";
import { getLogger } from "log4js";
import { Session } from "../session";

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

export class VoiceroidDaemonSpeaker extends Speaker<void> {
  protected urlBase: string;
  private checkUrl: string;
  private speechTextUrl: string;

  constructor(session: Session, urlBase: string) {
    super(session);
    this.urlBase = urlBase;
    this.checkUrl = `${urlBase}/`;
    this.speechTextUrl = `${urlBase}/api/speechtext`;

    void this.checkInitialActiveness();
  }

  async synthesis(
    speechText: SpeechText,
    voiceParam: VoiceParam<void>,
    pauseParam: PauseParam
  ): Promise<AudioResource> {
    const query: VoiceroidDaemonQuery = {
      Text: speechText.text,
      Speaker: {
        Volume: speechText.volume,
        Speed: speechText.speed,
        Pitch: voiceParam.pitch,
        Emphasis: voiceParam.intonation,
        PauseMiddle: pauseParam.shortPause,
        PauseLong: pauseParam.longPause,
        PauseSentence: pauseParam.sentencePause,
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

    throw Error("Failed to Synthesis");
  }

  checkInitialActiveness(): Promise<void> {
    logger.debug("checkInitialActiveness");
    return new Promise<void>((resolve) => {
      axios({
        method: "GET",
        url: this.checkUrl,
      })
        .then(() => {
          logger.debug(`${this.urlBase} active`);
          this.status = "active";
          resolve();
        })
        .catch((err) => {
          logger.debug(`${this.urlBase} inactive`);
          logger.debug(err);
          this.status = "inactive";
          resolve();
        });
    });
  }
}
