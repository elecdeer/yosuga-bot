import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import async from "async";
import { getLogger } from "log4js";

import { Session } from "./session";
import { SpeechTask } from "./types";

const logger = getLogger("speechQueue");

export type SpeechQueue = async.QueueObject<SpeechTask>;
export const createSpeechQueue = (session: Session): SpeechQueue => {
  const worker = async (task: SpeechTask): Promise<void> => {
    const config = session.getConfig();

    const voiceProvider = session.getVoiceProvider();

    const resource = await voiceProvider
      .synthesis(task.speechText, task.voiceOption, config.pauseParam)
      .catch((err) => {
        logger.error(err);
      });
    if (!resource) {
      logger.debug("synthesis failed");
      return;
    }

    const player = session.player;
    player.play(resource);
    logger.debug("Play start");
    await entersState(player, AudioPlayerStatus.Playing, 100);

    logger.debug("Playing");
    await entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1);

    logger.debug("Play finish");
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
