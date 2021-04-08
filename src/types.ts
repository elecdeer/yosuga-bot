import { Readable } from "stream";
import { StreamType } from "discord.js";

export interface VoiceParam {
  pitch: number;
  intonation: number;
}

export interface PauseParam {
  shortPause: number;
  longPause: number;
  sentencePause: number;
}

export interface SpeechText {
  text: string;
  speed: number;
  volume: number;
}

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

export interface Speaker<T extends VoiceParam, U> {
  synthesisSpeech: (query: U) => Promise<SynthesisResult>;

  constructSynthesisQuery: (speechText: SpeechText, voiceParam: T, pauseParam: PauseParam) => U;

  checkIsEnableSynthesizer: () => Promise<boolean>;
}
