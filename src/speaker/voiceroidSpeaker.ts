import { Readable } from "stream";
import axios from "axios";
import { PauseParam, Speaker, SpeechText, SynthesisResult, VoiceParam } from "../types";

export type VoiceroidQuery = Partial<{
  Text: string;
  Kana: string;
  Speaker: VoiceroidSpeakerParam;
}>;

export type VoiceroidSpeakerParam = Partial<{
  Volume: number;
  Speed: number;
  Pitch: number;
  Emphasis: number;
  PauseMiddle: number;
  PauseLong: number;
  PauseSentence: number;
}>;

const speechTextUrl = `${process.env.VOICEROID_DEAMON_URL}/api/speechtext`;
const checkUrl = `${process.env.VOICEROID_DEAMON_URL}/`;

export class VoiceroidSpeaker implements Speaker<VoiceroidQuery> {
  constructSynthesisQuery(
    speechText: SpeechText,
    voiceParam: VoiceParam,
    pauseParam: PauseParam
  ): VoiceroidQuery {
    return {
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
  }

  async synthesisSpeech(query: VoiceroidQuery): Promise<SynthesisResult> {
    const res = await axios.post<Readable>(speechTextUrl, query, {
      responseType: "stream",
    });
    if (res.status === 200) {
      return {
        stream: res.data,
      };
    } else {
      throw Error("Failed to Synthesis");
    }
  }

  checkIsEnableSynthesizer(): Promise<boolean> {
    return new Promise((resolve) => {
      axios({
        method: "GET",
        url: checkUrl,
      })
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }
}
