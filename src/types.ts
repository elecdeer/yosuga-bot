import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  Guild,
  GuildMember,
  MessageEmbed,
  StageChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";

import { YosugaEventEmitter } from "./yosugaEventEmitter";
import { GuildConfigWithoutVoice } from "./configManager";
import { Session } from "./session";

// ====================
// General
// ====================

export type PartiallyPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type VoiceOrStageChannel = VoiceChannel | StageChannel;

// ====================
// Voice
// ====================

// export type synthesisEngine = "voiceroidDaemon" | "assistantSeika";

export type VoiceParam<T> = {
  pitch: number;
  intonation: number;
  additionalOption?: T;
};

export type VoiceOption = {
  speakerName: string;
  voiceParam: VoiceParam<unknown>;
};

//
// export type VoiceParamBind<T> = Exclude<VoiceParam, SpeakerParam> & { speakerOption: T };
//
// export type SpeakerParam = AIVoiceParam | VoiceroidParam;
//
// export type VoiceroidParam = {
//   speaker: "voiceroid";
// };
//
// export type AIVoiceParam = {
//   speaker: "aivoice";
//   cid: number;
//   emotionHappy: number;
//   emotionAngry: number;
//   emotionSad: number;
// };

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
  voiceOption: VoiceOption;
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

// export type SynthesisResult = {
//   stream: Readable;
//   type?: StreamType;
// };
//
// export interface Speaker<T extends SpeakerParam, U> {
//   synthesisSpeech: (query: U) => Promise<SynthesisResult>;
//
//   constructSynthesisQuery: (
//     speechText: SpeechText,
//     voiceParam: VoiceParamBind<T>,
//     pauseParam: PauseParam
//   ) => U;
//
//   checkIsActiveSynthesizer: () => Promise<boolean>;
// }

// ====================
// Config
// ====================

export type GuildConfig = {
  commandPrefix: string;
  voiceOption: VoiceOption;
  pauseParam: PauseParam;
  wordDictionary: WordDictionary;
  masterVolume: number;
  masterSpeed: number;
  fastSpeedScale: number;
  readStatusUpdate: boolean;
  readTimeSignal: boolean;
  timeToAutoLeaveSec: number;
  timeToReadMemberNameSec: number;
  ignorePrefix: string;
  maxStringLength: number;
  enableSlashCommand: boolean;
};

export type WordDictionary = WordItem[];
export type WordItem = {
  type: "segment" | "all" | "regex";
  word: string;
  read: string;
};

export type UserConfig = {
  voiceOption: VoiceOption;
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

export type CommandData = ChatInputApplicationCommandData & {
  alias?: string[];
  // execute: CommandExecutor;
};

export type CommandContextBase = {
  session: Session | null;
  config: GuildConfigWithoutVoice;
  guild: Guild;
  user: GuildMember;
  textChannel: TextChannel;
};

export type TextCommandContext = CommandContextBase & {
  type: "text";
};

export type InteractionCommandContext = CommandContextBase & {
  type: "interaction";
  interaction: CommandInteraction;
};

export type CommandContext = TextCommandContext | InteractionCommandContext;
