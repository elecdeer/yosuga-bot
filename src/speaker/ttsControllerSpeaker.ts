import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import axios from "axios";
import { getLogger } from "log4js";
import { opus } from "prism-media";
import { Readable } from "stream";

import { Session } from "../session";
import { AdditionalVoiceParam, SpeechText, VoiceParam } from "../types";
import { Result, success } from "../util/result";
import { wait } from "../util/util";
import { SIOAudioRecorder } from "./socketIOAudioRecorder";
import { Speaker, SpeakerState } from "./speaker";
import { ttsControllerOccupier } from "./ttsControllerOccupier";

export type TtsSpeakerBuildOption = {
  type: "ttsController";
  urlBase: string;
  voiceName: string;
  outputDevice: string;
  wsUrl: string;
  callName: string;
};

type TtsControllerQuery = {
  text: string;
  name: string;
  speaker: string;
  volume: number;
  speed: number;
  pitch: number;
  range: number;
};

const logger = getLogger("ttsControllerSpeaker");

export class TtsControllerSpeaker extends Speaker {
  protected option: TtsSpeakerBuildOption;
  protected recorder: SIOAudioRecorder;

  constructor(session: Session, option: TtsSpeakerBuildOption) {
    super(session, "ttsController");
    this.option = option;
    this.recorder = new SIOAudioRecorder(this.option.wsUrl);
  }

  async checkValidConnection(): Promise<boolean> {
    if (!this.recorder.isActiveConnection()) {
      return false;
    }

    try {
      //name=""にすると接続確認だけできる
      await axios.get(this.option.urlBase, {
        params: {
          text: "",
          name: "",
        },
        timeout: 3000,
        validateStatus: (status) => status === 200,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  override async checkInitialActiveness(): Promise<SpeakerState> {
    logger.debug("checkInitialActiveness");

    if (!ttsControllerOccupier.canUse(this.session)) {
      return "inactive";
    }

    if (!(await this.checkValidConnection())) {
      return "inactive";
    }

    const timeout: Promise<SpeakerState> = wait(3000).then(() => {
      return "inactive";
    });

    const testSynthesis = this.synthesisStream(
      {
        text: "テスト",
        speed: 2,
        volume: 1,
      },
      {
        intonation: 1,
        pitch: 1,
      }
    ).then(
      (result) =>
        new Promise<SpeakerState>((resolve) => {
          if (result.isFailure()) {
            return "inactive";
          }
          const stream = result.value;
          stream.once("data", () => {
            resolve("active");
          });
        })
    );

    return Promise.race([timeout, testSynthesis]).then((value) => {
      logger.debug(`${value}`);
      if (value === "active" && ttsControllerOccupier.canUse(this.session)) {
        ttsControllerOccupier.use(this.session);
        return "active";
      }
      return "inactive";
    });
  }

  override async synthesis(
    speechText: SpeechText,
    voiceParam: VoiceParam<AdditionalVoiceParam>
  ): Promise<Result<AudioResource, Error>> {
    const streamResult = await this.synthesisStream(speechText, voiceParam);

    if (streamResult.isFailure()) return streamResult;

    const resource = createAudioResource(streamResult.value, {
      inputType: StreamType.Opus,
      silencePaddingFrames: 0,
      inlineVolume: false,
    });

    return success(resource);
  }

  protected async synthesisStream(
    speechText: SpeechText,
    voiceParam: VoiceParam<AdditionalVoiceParam>
  ): Promise<Result<Readable, Error>> {
    logger.debug(this.option);

    // const url = `${this.option.urlBase}/?${urlParams.toString()}`;
    // logger.debug(`url: ${url}`);
    const params: TtsControllerQuery = {
      text: speechText.text,
      name: this.option.callName,
      speaker: this.option.outputDevice,
      volume: speechText.volume,
      speed: speechText.speed,
      pitch: voiceParam.pitch,
      range: voiceParam.intonation,
    };

    const start = () =>
      axios.get(this.option.urlBase, {
        params: params,
      });

    const streamResult = await this.recorder.recordAudioStream(start);

    if (streamResult.isFailure()) {
      return streamResult;
    }

    const opusStream = streamResult.value.pipe(
      new opus.Encoder({
        channels: 1,
        rate: 48000,
        frameSize: 960,
      })
    );

    return success(opusStream);
  }
}
