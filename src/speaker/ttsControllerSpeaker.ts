import { Speaker, SpeakerState } from "./speaker";
import { PauseParam, SpeechText, VoiceParam } from "../types";
import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import { Session } from "../session";
import { SIOAudioRecorder } from "./socketIOAudioRecorder";
import axios from "axios";
import { getLogger } from "log4js";

// import { opus } from "prism-media";
// import Encoder = opus.Encoder;
import { opus } from "prism-media";
import { Readable } from "stream";
import { ttsControllerOccupier } from "./ttsControllerOccupier";
import { URLSearchParams } from "url";
import { wait } from "../util";

type TtsControllerSpeakerConfig = {
  urlBase: string;
  voiceName: string;
  outputDevice: string;
  wsUrl: string;
};

const logger = getLogger("ttsControllerSpeaker");

export class TtsControllerSpeaker extends Speaker {
  protected config: TtsControllerSpeakerConfig;
  protected recorder: SIOAudioRecorder;

  constructor(session: Session, config: TtsControllerSpeakerConfig) {
    super(session, "ttsController");
    this.config = config;
    this.recorder = new SIOAudioRecorder(this.config.wsUrl);
  }

  override async checkInitialActiveness(): Promise<SpeakerState> {
    //TODO これだと複数のTtsControllerSpeakerが存在した場合、同時にチェックしようとしてコンフリクトする

    if (!ttsControllerOccupier.canUse(this.session)) {
      return "inactive";
    }

    logger.debug("checkInitialActiveness");

    // return "active";
    const stream = await this.synthesisStream(
      {
        text: "テスト",
        speed: 2,
        volume: 1,
      },
      {
        intonation: 1,
        pitch: 1,
      },
      this.session.getConfig().pauseParam
    );

    const timeout: Promise<SpeakerState> = wait(3000).then(() => "inactive");

    const active: Promise<SpeakerState> = new Promise((resolve) => {
      stream.once("data", (chunk) => {
        resolve("active");
      });
    });

    return Promise.race([timeout, active]).then((value) => {
      logger.debug(`${value}`);
      if (value === "active") {
        ttsControllerOccupier.use(this.session);
      }
      return value;
    });
  }

  override async synthesis(
    speechText: SpeechText,
    voiceParam: VoiceParam<unknown>,
    pauseParam: PauseParam
  ): Promise<AudioResource> {
    const stream = await this.synthesisStream(speechText, voiceParam, pauseParam);

    const resource = createAudioResource(stream, {
      inputType: StreamType.Opus,
      silencePaddingFrames: 0,
      inlineVolume: false,
    });

    // stream.on("data", (chunk) => {
    //   logger.debug(chunk);
    // });
    // stream.on("finish", () => {
    //   logger.debug("stream finish");
    // });

    return resource;
  }

  protected async synthesisStream(
    speechText: SpeechText,
    voiceParam: VoiceParam<unknown>,
    pauseParam: PauseParam
  ): Promise<Readable> {
    logger.debug(this.config);

    const urlParams = new URLSearchParams();
    urlParams.append("text", speechText.text);
    urlParams.append("name", this.config.voiceName);
    urlParams.append("speaker", this.config.outputDevice);
    urlParams.append("volume", String(speechText.volume));
    urlParams.append("speed", String(speechText.speed));
    urlParams.append("pitch", String(voiceParam.pitch));
    urlParams.append("range", String(voiceParam.intonation));

    const url = `${this.config.urlBase}/?${urlParams.toString()}`;
    logger.debug(`url: ${url}`);

    const start = () => axios.get(url);

    const stream = await this.recorder.recordAudioStream(start);
    return stream.pipe(
      new opus.Encoder({
        channels: 1,
        rate: 48000,
        frameSize: 960,
      })
    );
  }
}
