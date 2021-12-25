import { Snowflake, StageChannel, VoiceChannel } from "discord.js";

import { Session } from "./session";

// ====================
// General
// ====================

export type UserId = Snowflake;
export type GuildId = Snowflake;
export type AppId = Snowflake;

export type VoiceOrStageChannel = VoiceChannel | StageChannel;

export type Awaited = PromiseLike<void> | void;
export type EventsBase = Record<string, [...unknown[]]>;
export interface TypedEventEmitter<TEvents extends EventsBase> {
  on<K extends keyof TEvents>(event: K, listener: (...args: TEvents[K]) => Awaited): this;
  once<K extends keyof TEvents>(event: K, listener: (...args: TEvents[K]) => Awaited): this;
  emit<K extends keyof TEvents>(event: K, ...args: TEvents[K]): boolean;
  off<K extends keyof TEvents>(event: K, listener: (...args: TEvents[K]) => Awaited): this;
  removeAllListeners<K extends keyof TEvents>(event?: K): this;
}

export type SessionEventHandlerRegistrant = (session: Session) => Awaited;

// ====================
// Voice
// ====================

export type AdditionalVoiceParam = Record<string, string | number | boolean>;
export type VoiceParam<T extends AdditionalVoiceParam> = {
  pitch: number;
  intonation: number;
  additionalOption?: T;
};

export type SpeakerOption = {
  speakerName: string;
  voiceParam: VoiceParam<AdditionalVoiceParam>;
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
  voiceOption: SpeakerOption;
  speechText: SpeechText;
};

//
// export type WordDictionary = WordItem[];
// export type WordItem = {
//   type: "segment" | "all" | "regex";
//   word: string;
//   read: string;
// };
