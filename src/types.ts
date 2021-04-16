import { Readable } from "stream";
import { StreamType } from "discord.js";

export type PartiallyPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type VoiceParam = {
  speakerOption: SpeakerParam;
  pitch: number;
  intonation: number;
};

export type VoiceParamBind<T> = Exclude<VoiceParam, SpeakerParam> & { speakerOption: T };

export type SpeakerParam = AIVoiceParam | VoiceroidParam;

export type VoiceroidParam = {
  speaker: "voiceroid";
};

export type AIVoiceParam = {
  speaker: "aivoice";
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

export interface Speaker<T extends SpeakerParam, U> {
  synthesisSpeech: (query: U) => Promise<SynthesisResult>;

  constructSynthesisQuery: (
    speechText: SpeechText,
    voiceParam: VoiceParamBind<T>,
    pauseParam: PauseParam
  ) => U;

  checkIsActiveSynthesizer: () => Promise<boolean>;
}

export type GuildConfig = {
  commandPrefix: string;
  voiceParam: VoiceParam;
  pauseParam: PauseParam;
  wordDictionary: WordDictionary;
  masterVolume: number;
  masterSpeed: number;
  readStatusUpdate: boolean;
  readTimeSignal: boolean;
  timeToAutoLeaveSec: number;
  timeToReadMemberNameSec: number;
  ignorePrefix: string;
};

export type WordDictionary = WordItem[];
export type WordItem = {
  type: "segment" | "all" | "regex";
  word: string;
  read: string;
};

export type UserConfig = {
  voiceParam: VoiceParam;
};
