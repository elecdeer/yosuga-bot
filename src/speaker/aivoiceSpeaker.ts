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

export interface AIVoiceParam extends VoiceParam {
  emotionHappy: number;
  emotionAngry: number;
  emotionSad: number;
}

export type AIVoiceQuery = Partial<{
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

export class AIVoiceSpeaker implements Speaker<AIVoiceParam, AIVoiceQuery> {
  constructSynthesisQuery(
    speechText: SpeechText,
    voiceParam: AIVoiceParam,
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
        喜び: voiceParam.emotionHappy,
        怒り: voiceParam.emotionAngry,
        悲しみ: voiceParam.emotionSad,
      },
    };
  }

  async synthesisSpeech(query: AIVoiceQuery): Promise<SynthesisResult> {
    socket.emit("start");
    const stream = await getAudioStreamFromSocket();
    await wait(200);

    const res = axios
      .post(`${assistantSeikaUrl}/PLAY2/5202`, query, {
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
