import { VoiceBroadcast } from "discord.js";
import { Readable } from "stream";
import axios from "axios";
import { Speaker, SpeechParam } from "./speaker";
import { logger } from "../commands/commands";

export class VoiceroidSpeaker implements Speaker {
  async getSpeech(param: SpeechParam): Promise<string | VoiceBroadcast | Readable> {
    logger.debug("post param", JSON.stringify(param));

    const res = await axios.post<Readable>(
      `${process.env.VOICEROID_DEAMON_URL}/api/speechtext`,
      param,
      {
        responseType: "stream",
      }
    );

    return res.data;
  }

  test(): Promise<"ok" | Error> {
    return new Promise((resolve, reject) => {
      axios({
        method: "GET",
        url: `${process.env.VOICEROID_DEAMON_URL}/`,
      })
        .then((_) => {
          resolve("ok");
        })
        .catch((reason) => {
          reject(reason);
        });
    });
  }
}
