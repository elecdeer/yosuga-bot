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
export type MasterConfig = MasterLevelConfig & GuildLevelConfig & UserLevelConfig;
export type GuildConfig = GuildLevelConfig & UserLevelConfig;
export type UserConfig = UserLevelConfig;

//Store用
export type MasterConfigRecord = Record<string, Partial<MasterConfig>>;
export type GuildConfigRecord = Record<string, Partial<GuildConfig>>;
export type UserConfigRecord = Record<string, Partial<UserConfig>>;

export type MasterLevel = "MASTER";
export type GuildLevel = "GUILD";
export type UserLevel = "USER";

export type ConfigCommandLevel = MasterLevel | GuildLevel | UserLevel;

// prettier-ignore
export type ConfigEachLevel<TLevels extends ConfigCommandLevel> = Record<string, never> &
  (MasterLevel extends TLevels ? MasterLevelConfig : unknown) &
  (GuildLevel extends TLevels ? GuildLevelConfig : unknown) &
  (UserLevel extends TLevels ? UserLevelConfig : unknown);
