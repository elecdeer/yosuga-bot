import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import { getLogger } from "log4js";

import { Session } from "../session";
import { AdditionalVoiceParam, SpeechText, VoiceParam } from "../types";
import { failure, Result, success } from "../util/result";
import { remap } from "../util/util";
import { Speaker, SpeakerState } from "./speaker";
import { createVoicevoxClient } from "./voicevoxApi";

const logger = getLogger("voicevoxSpeaker");

export type VoicevoxSpeakerBuildOption = {
  type: "voicevox";
  urlBase: string;
  speakerUUID: string;
  styleName: string;
};

//ボイス登録時はstyleIdで指定
//設定データはspeaker_uuidとstyleNameで持つ

export class VoicevoxSpeaker extends Speaker {
  protected voicevoxClient: ReturnType<typeof createVoicevoxClient>;
  private speakerOption: Pick<VoicevoxSpeakerBuildOption, "speakerUUID" | "styleName">;

  protected speakerId: number | null = null;

  constructor(session: Session, option: VoicevoxSpeakerBuildOption) {
    super(session, "voicevox");
    this.voicevoxClient = createVoicevoxClient(option.urlBase);
    this.speakerOption = option;
  }

  async fetchSpeakerId(speakerUUID: string, styleName: string): Promise<number> {
    const speakers = await this.voicevoxClient.speakers.$get();
    const speaker = speakers.find((item) => item.speaker_uuid === speakerUUID);
    if (!speaker) throw new Error(`speaker ${speakerUUID}は存在しません`);
    const style = speaker.styles.find((item) => item.name === styleName);
    if (!style) throw new Error(`${speaker.name}にstyle ${styleName}は存在しません`);
    return style.id;
  }

  override async checkInitialActiveness(): Promise<SpeakerState> {
    try {
      this.speakerId = await this.fetchSpeakerId(
        this.speakerOption.speakerUUID,
        this.speakerOption.styleName
      );

      const audioQuery = await this.voicevoxClient.audio_query.$post({
        query: {
          text: "テスト",
          speaker: this.speakerId,
        },
      });

      const res = await this.voicevoxClient.synthesis.$post({
        query: {
          speaker: this.speakerId,
        },
        body: audioQuery,
        config: {
          responseType: "stream",
        },
      });

      return "active";
    } catch (e) {
      return "inactive";
    }
  }

  override async synthesis(
    speechText: SpeechText,
    voiceParam: VoiceParam<AdditionalVoiceParam>
  ): Promise<Result<AudioResource, Error>> {
    if (!this.speakerId) return failure(new Error("speakerIdが取得できていません"));

    try {
      const audioQueryBase = await this.voicevoxClient.audio_query.$post({
        query: {
          text: speechText.text,
          speaker: this.speakerId,
        },
      });

      //yosuga側のパラメータは全て0-2で1が標準
      //voicevox側は音高のみ-0.15~0.15

      const query: typeof audioQueryBase = {
        ...audioQueryBase,
        volumeScale: speechText.volume,
        speedScale: speechText.speed,
        pitchScale: remap(voiceParam.pitch, 0, 2, -0.15, 0.15),
        intonationScale: voiceParam.intonation,
      };

      const resWav = await this.voicevoxClient.synthesis.$post({
        query: {
          speaker: this.speakerId,
        },
        body: query,
        config: {
          responseType: "stream",
        },
      });

      const resource = createAudioResource(resWav, {
        inputType: StreamType.Arbitrary,
      });

      return success(resource);
    } catch (e) {
      logger.error(e);
      return failure(new Error("synthesis request failed"));
    }
  }
}