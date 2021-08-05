import { SpeechTask, VoiceParamBind } from "./types";
import { getLogger } from "log4js";
import { getGuildConfig } from "./configManager";
import async from "async";
import { SpeakerMap } from "./speaker/speakersBuilder";
import { AudioPlayerStatus, createAudioResource, entersState } from "@discordjs/voice";
import { Session } from "./session";

const logger = getLogger("speechQueue");

export type SpeechQueue = async.QueueObject<SpeechTask>;
export const createSpeechQueue = (session: Session, speakerMap: SpeakerMap): SpeechQueue => {
  const worker = async (task: SpeechTask): Promise<void> => {
    const guildId = session.getVoiceChannel().guild.id;
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

    const resource = createAudioResource(result.stream, {
      inputType: result.type,
    });

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
