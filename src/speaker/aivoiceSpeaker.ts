// import {
//   AIVoiceParam,
//   PauseParam,
//   Speaker,
//   SpeechText,
//   SynthesisResult,
//   VoiceParamBind,
// } from "../types";
//
// import * as util from "util";
// import { io } from "socket.io-client";
//
// import ss from "@sap_oss/node-socketio-stream";
// import { Readable } from "stream";
// import axios from "axios";
// import { yosugaEnv } from "../environment";
// import { getLogger } from "log4js";
// import { StreamType } from "@discordjs/voice";
//
// const logger = getLogger("aivoiceSpeaker");
// const wait = util.promisify(setTimeout);
//
// export type AIVoiceQuery = Partial<{
//   cid: number;
//   talktext: string;
//   effects: {
//     volume: number;
//     speed: number;
//     pitch: number;
//     intonation: number;
//     shortpause: number;
//     longpause: number;
//   };
//   emotions: {
//     喜び: number;
//     怒り: number;
//     悲しみ: number;
//   };
// }>;
//
// const basicAuthParam = {
//   username: yosugaEnv.assistantSeikaBasicUser ?? "",
//   password: yosugaEnv.assistantSeikaBasicPassword ?? "",
// };
// const checkUrl = `${yosugaEnv.assistantSeikaUrl}/VERSION`;
// const fetchUrl = `${yosugaEnv.assistantSeikaUrl}/PLAY2`;
//
// const socket = io(yosugaEnv.socketIOAudioRecorderWSUrl);
//
// export class AIVoiceSpeaker implements Speaker<AIVoiceParam, AIVoiceQuery> {
//   constructSynthesisQuery(
//     speechText: SpeechText,
//     voiceParam: VoiceParamBind<AIVoiceParam>,
//     pauseParam: PauseParam
//   ): AIVoiceQuery {
//     return {
//       cid: voiceParam.speakerOption.cid,
//       talktext: speechText.text,
//       effects: {
//         volume: speechText.volume,
//         speed: speechText.speed,
//         pitch: voiceParam.pitch,
//         intonation: voiceParam.intonation,
//         shortpause: pauseParam.shortPause,
//         longpause: pauseParam.longPause,
//       },
//       emotions: {
//         喜び: voiceParam.speakerOption?.emotionHappy ?? 0,
//         怒り: voiceParam.speakerOption?.emotionAngry ?? 0,
//         悲しみ: voiceParam.speakerOption?.emotionSad ?? 0,
//       },
//     };
//   }
//
//   async synthesisSpeech(query: AIVoiceQuery): Promise<SynthesisResult> {
//     socket.emit("start");
//     const stream = await getAudioStreamFromSocket();
//     await wait(200);
//
//     const res = axios
//       .post(`${fetchUrl}/${query.cid ?? 5201}`, query, {
//         auth: basicAuthParam,
//       })
//       .then((res) => {
//         logger.debug("response received", res.status);
//         socket.emit("end");
//       });
//
//     return {
//       stream: stream,
//       type: StreamType.Opus,
//     };
//   }
//
//   checkIsActiveSynthesizer(): Promise<boolean> {
//     return new Promise((resolve) => {
//       axios({
//         method: "GET",
//         url: checkUrl,
//         auth: basicAuthParam,
//       })
//         .then((value) => {
//           resolve(true);
//         })
//         .catch((reason) => {
//           resolve(false);
//         });
//     });
//   }
// }
//
// const getAudioStreamFromSocket = () =>
//   new Promise<Readable>((resolve, reject) => {
//     ss(socket).once("sendStream", (stream: Readable) => {
//       console.log("on sendStream");
//       stream.on("data", (chunk) => {
//         console.log(chunk);
//       });
//       resolve(stream);
//     });
//   });
