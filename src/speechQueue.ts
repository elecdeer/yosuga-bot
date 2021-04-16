import { SpeechTask, VoiceParamBind } from "./types";
import { getLogger } from "log4js";
import { getGuildConfig } from "./configManager";
import async from "async";
import { SpeakerMap } from "./speaker/speakersBuilder";
import { VoiceConnection } from "discord.js";

const logger = getLogger("speechQueue");

export type SpeechQueue = async.QueueObject<SpeechTask>;
export const createSpeechQueue = (
  guildId: string,
  speakerMap: SpeakerMap,
  connection: VoiceConnection
): SpeechQueue => {
  const worker = async (task: SpeechTask): Promise<void> => {
    const config = getGuildConfig(guildId);

    const speakerValue = speakerMap[task.voiceParam.speakerOption.speaker];
    if (speakerValue.status !== "active") {
      return;
    }

    //敗北のany
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const voiceParam: VoiceParamBind<any> = task.voiceParam;

    const query = speakerValue.speaker.constructSynthesisQuery(
      task.speechText,
      voiceParam,
      config.pauseParam
    );

    logger.debug("query", query);

    const result = await speakerValue.speaker.synthesisSpeech(query);
    await new Promise<void>((resolve) => {
      const dispatcher = connection.play(result.stream, {
        type: result.type ?? "unknown",
      });

      dispatcher.once("finish", () => {
        logger.debug("resolve");
        resolve();
      });
    });
  };

  return async.queue<SpeechTask, Error>((task, callback) => {
    worker(task)
      .then(() => {
        callback(null);
      })
      .catch((err) => {
        callback(err);
      });
  });
};
