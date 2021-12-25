import { SpeakerBuildOption } from "../speaker/voiceProvider";
import { SpeakerOption } from "../types";

export type MasterLevelConfig = {
  speakerBuildOptions: Record<string, SpeakerBuildOption>;
};

export type GuildLevelConfig = {
  commandPrefix: string;
  ignorePrefix: string;
  masterVolume: number;
  masterSpeed: number;
  fastSpeedScale: number;
  readStatusUpdate: boolean;
  readTimeSignal: boolean;
  timeToAutoLeaveSec: number;
  timeToReadMemberNameSec: number;
  maxStringLength: number;
};

export type UserLevelConfig = {
  speakerOption: SpeakerOption;
};

export type UnifiedConfig = MasterLevelConfig & GuildLevelConfig & UserLevelConfig;
export type MasterConfig = UnifiedConfig;
export type GuildConfig = Partial<GuildLevelConfig & UserLevelConfig>;
export type UserConfig = Partial<UserLevelConfig>;

//Store用
export type MasterConfigRecord = Record<string, MasterConfig>;
export type GuildConfigRecord = Record<string, GuildConfig>;
export type UserConfigRecord = Record<string, UserConfig>;

type ValueResolvable<T> = T | ((value: T) => T);
export type ValueResolvableOptional<T> = T | undefined | ((value: T | undefined) => T | undefined);
export type MasterLevel = "MASTER";
export type GuildLevel = "GUILD";
export type UserLevel = "USER";
export type ConfigCommandLevel = MasterLevel | GuildLevel | UserLevel;
export type LevelConfigMap<T> = Required<T> extends Required<MasterConfig>
  ? MasterLevel
  : Required<T> extends Required<GuildConfig>
  ? MasterLevel | GuildLevel
  : Required<T> extends Required<UserConfig>
  ? MasterLevel | GuildLevel | UserLevel
  : never;
