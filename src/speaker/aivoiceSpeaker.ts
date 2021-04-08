import { PauseParam, Speaker, SpeechText, SynthesisResult, VoiceParam } from "../types";

import * as util from "util";
import { io } from "socket.io-client";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ss from "socket.io-stream";
import { Readable } from "stream";
import axios from "axios";
import { logger } from "../commands/commands";

const wait = util.promisify(setTimeout);

export type AIVoiceQuery = Partial<{
  cid: number;
  talktext: string;
  effects: {
    volume: number;
    speed: number;
    pitch: number;
    intonation: number;
    shortpause: number;
    longpause: number;
  };
  emotions: {
    喜び: number;
    怒り: number;
    悲しみ: number;
  };
}>;

const assistantSeikaUrl = "http://192.168.0.14:7180/";
const basicAuthParam = {
  username: "SeikaServerUser",
  password: "SeikaServerPassword",
};
const checkUrl = `${assistantSeikaUrl}/VERSION`;

const socket = io("http://192.168.0.14:443");

export class AIVoiceSpeaker implements Speaker<AIVoiceQuery> {
  constructSynthesisQuery(
    speechText: SpeechText,
    voiceParam: VoiceParam,
    pauseParam: PauseParam
  ): AIVoiceQuery {
    return {
      talktext: speechText.text,
      effects: {
        volume: speechText.volume,
        speed: speechText.speed,
        pitch: voiceParam.pitch,
        intonation: voiceParam.intonation,
        shortpause: pauseParam.shortPause,
        longpause: pauseParam.longPause,
      },
      emotions: {
        喜び: voiceParam.additionalOption?.emotionHappy ?? 0,
        怒り: voiceParam.additionalOption?.emotionAngry ?? 0,
        悲しみ: voiceParam.additionalOption?.emotionSad ?? 0,
      },
    };
  }

  async synthesisSpeech(query: AIVoiceQuery): Promise<SynthesisResult> {
    socket.emit("start");
    const stream = await getAudioStreamFromSocket();
    await wait(200);

    const res = axios
      .post(`${assistantSeikaUrl}/PLAY2/${query.cid ?? 5201}`, query, {
        auth: basicAuthParam,
      })
      .then((res) => {
        logger.debug("response received", res.status);
        socket.emit("end");
      });

    return {
      stream: stream,
      type: "opus",
    };
  }

  checkIsEnableSynthesizer(): Promise<boolean> {
    return new Promise((resolve) => {
      axios({
        method: "GET",
        url: checkUrl,
        auth: basicAuthParam,
      })
        .then((value) => {
          resolve(true);
        })
        .catch((reason) => {
          resolve(false);
        });
    });
  }
}

const getAudioStreamFromSocket = () =>
  new Promise<Readable>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    ss(socket).once("sendStream", (stream: Readable) => {
      console.log("on sendStream");
      stream.on("data", (chunk) => {
        console.log(chunk);
      });
      resolve(stream);
    });
  });
