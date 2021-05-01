import { Readable } from "stream";
import { Guild, GuildMember, MessageEmbed, StreamType, TextChannel } from "discord.js";

import { YosugaEventEmitter } from "./yosugaEventEmitter";
import { GuildConfigWithoutVoice } from "./configManager";
import { Session } from "./session";

// ====================
// General
// ====================

export type PartiallyPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ====================
// Voice
// ====================

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

// ====================
// Processor
// ====================

export type TextProcessor = (text: Readonly<SpeechText>) => Promise<SpeechText[] | SpeechText>;
export type ProcessorProvider<T> = (arg: T) => TextProcessor;

// ====================
// Speaker
// ====================

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

// ====================
// Config
// ====================

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

// ====================
// Event
// ====================

export type SessionEventHandlerRegistrant = (session: Session) => void;
export type GlobalEventHandlerRegistrant = (emitter: YosugaEventEmitter) => void;

// ====================
// Command
// ====================

export type CommandExecutor = (
  args: Array<string>,
  context: CommandContext
) => Promise<MessageEmbed>;

export type Command = {
  trigger: string[];
  description: string;
  usage: string;
  execute: CommandExecutor;
};

export interface CommandContext {
  session: Session | null;
  config: GuildConfigWithoutVoice;
  guild: Guild;
  user: GuildMember;
  textChannel: TextChannel;
}
