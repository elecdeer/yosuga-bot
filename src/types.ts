import { Snowflake, StageChannel, VoiceChannel } from "discord.js";

// ====================
// General
// ====================

export type UserId = Snowflake;
export type GuildId = Snowflake;
export type AppId = Snowflake;

export type VoiceOrStageChannel = VoiceChannel | StageChannel;

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
