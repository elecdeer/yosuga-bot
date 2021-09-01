import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import axios from "axios";
import { getLogger } from "log4js";
import { opus } from "prism-media";
import { Readable } from "stream";
import { URLSearchParams } from "url";

import { Session } from "../session";
import { AdditionalVoiceParam, PauseParam, SpeechText, VoiceParam } from "../types";
import { wait } from "../util";
import { SIOAudioRecorder } from "./socketIOAudioRecorder";
import { Speaker, SpeakerState } from "./speaker";
import { ttsControllerOccupier } from "./ttsControllerOccupier";

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
    if (!ttsControllerOccupier.canUse(this.session)) {
      return "inactive";
    }

    logger.debug("checkInitialActiveness");

    const config = await this.session.getConfig();
    const stream = await this.synthesisStream(
      {
        text: "テスト",
        speed: 2,
        volume: 1,
      },
      {
        intonation: 1,
        pitch: 1,
      }
    );

    if (!stream) {
      return "inactive";
    }

    const timeout: Promise<SpeakerState> = wait(3000).then(() => {
      return "inactive";
    });

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
    voiceParam: VoiceParam<AdditionalVoiceParam>
  ): Promise<AudioResource | null> {
    const stream = await this.synthesisStream(speechText, voiceParam);

    if (!stream) return null;

    return createAudioResource(stream, {
      inputType: StreamType.Opus,
      silencePaddingFrames: 0,
      inlineVolume: false,
    });
  }

  protected async synthesisStream(
    speechText: SpeechText,
    voiceParam: VoiceParam<AdditionalVoiceParam>
  ): Promise<Readable | null> {
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

    try {
      const stream = await this.recorder.recordAudioStream(start);
      return stream.pipe(
        new opus.Encoder({
          channels: 1,
          rate: 48000,
          frameSize: 960,
        })
      );
    } catch (e) {
      return null;
    }
  }
}
