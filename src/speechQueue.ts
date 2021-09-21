import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import async from "async";
import { getLogger } from "log4js";

import { Session } from "./session";
import { SpeechTask } from "./types";

const logger = getLogger("speechQueue");

export type SpeechQueue = async.QueueObject<SpeechTask>;
export const createSpeechQueue = (session: Session): SpeechQueue => {
  const worker = async (task: SpeechTask): Promise<void> => {
    const voiceProvider = session.getVoiceProvider();

    const synthesisResult = await voiceProvider
      .synthesis(task.speechText, task.voiceOption)
      .catch((err) => {
        logger.error(err);
      });

    if (!synthesisResult || synthesisResult.isFailure()) {
      logger.debug("synthesis failed");
      return;
    }

    const player = session.player;
    player.play(synthesisResult.value);
    logger.debug("Play start");
    await entersState(player, AudioPlayerStatus.Playing, 100);

    logger.debug("Playing");
    await entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1);

    logger.debug("Play finish");
  };

  return async.queue<SpeechTask, Error>((task, callback) => {
    worker(task)
      .then(() => {
        logger.debug("complete work");
        callback(null);
      })
      .catch((err) => {
        logger.debug("thrown error");
        logger.error(err);
        callback(err);
      });
  });
};
