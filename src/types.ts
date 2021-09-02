import { StageChannel, VoiceChannel } from "discord.js";

import { Session } from "./session";

// ====================
// General
// ====================

// export type PartiallyPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

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

// ====================
// Voice
// ====================

// export type synthesisEngine = "voiceroidDaemon" | "assistantSeika";

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
  voiceOption: SpeakerOption;
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
//
// export type GuildConfig = {
//   commandPrefix: string;
//   voiceOption: SpeakerOption;
//   pauseParam: PauseParam;
//   wordDictionary: WordDictionary;
//   masterVolume: number;
//   masterSpeed: number;
//   fastSpeedScale: number;
//   readStatusUpdate: boolean;
//   readTimeSignal: boolean;
//   timeToAutoLeaveSec: number;
//   timeToReadMemberNameSec: number;
//   ignorePrefix: string;
//   maxStringLength: number;
//   enableSlashCommand: boolean;
// };
//
// export type WordDictionary = WordItem[];
// export type WordItem = {
//   type: "segment" | "all" | "regex";
//   word: string;
//   read: string;
// };
//
// export type UserConfig = {
//   voiceOption: SpeakerOption;
// };

// ====================
// Event
// ====================

export type SessionEventHandlerRegistrant = (session: Session) => Awaited;
// export type GlobalEventHandlerRegistrant = (emitter: YosugaEventEmitter) => void;

// ====================
// Command
// ====================

// export type CommandExecutor = (
//   args: Array<string>,
//   context: CommandContext
// ) => Promise<MessageEmbed>;

// export type CommandContextBase = {
//   session: Session | null;
//   config: GuildConfigWithoutVoice;
//   guild: Guild;
//   user: GuildMember;
//   textChannel: TextChannel;
// };
//
// export type TextCommandContext = CommandContextBase & {
//   type: "text";
// };
//
// export type InteractionCommandContext = CommandContextBase & {
//   type: "interaction";
//   interaction: CommandInteraction;
// };
//
// export type CommandContext = TextCommandContext | InteractionCommandContext;
