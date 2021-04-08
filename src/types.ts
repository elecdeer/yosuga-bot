import { Readable } from "stream";
import { StreamType } from "discord.js";

export type VoiceParam = {
  pitch: number;
  intonation: number;
  additionalOption?: AdditionalVoiceParam;
};

export type AdditionalVoiceParam = AIVoiceParam;

export type AIVoiceParam = {
  cid: number;
  emotionHappy: number;
  emotionAngry: number;
  emotionSad: number;
};

export type PauseParam = {
  shortPause: number;
  longPause: number;
  sentencePause: number;
};

export type SpeechText = {
  text: string;
  speed: number;
  volume: number;
};

export type SpeechTask = {
  voiceParam: VoiceParam;
  speechText: SpeechText;
};

export type TextProcessor = (text: Readonly<SpeechText>) => Promise<SpeechText[] | SpeechText>;
export type ProcessorProvider<T> = (arg: T) => TextProcessor;

export type SynthesisResult = {
  stream: Readable;
  type?: StreamType;
};

export interface Speaker<T> {
  synthesisSpeech: (query: T) => Promise<SynthesisResult>;

  constructSynthesisQuery: (
    speechText: SpeechText,
    voiceParam: VoiceParam,
    pauseParam: PauseParam
  ) => T;

  checkIsEnableSynthesizer: () => Promise<boolean>;
}
