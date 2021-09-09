import assert from "assert";
import { Collection, Snowflake } from "discord.js";
import { getLogger } from "log4js";

import { Speaker } from "../speaker/speaker";
import { SpeakerBuildOption } from "../speaker/voiceProvider";
import { SpeakerOption } from "../types";
import { YosugaClient } from "../yosugaClient";
import { ConfigAccessor } from "./configAccessor";
import { GuildConfigAccessor } from "./guildConfigAccessor";
import { GuildConfigStore } from "./guildConfigStore";
import { MasterConfigAccessor } from "./masterConfigAccessor";
import { MasterConfigStore } from "./masterConfigStore";
import { UnifiedConfigAccessor } from "./unifiedConfigAccessor";
import { UserConfigAccessor } from "./userConfigAccessor";
import { UserConfigStore } from "./userConfigStore";
import { ValidVoiceConfigAccessor } from "./validVoiceConfigAccessor";

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

export type MasterConfigRecord = Record<string, MasterConfig>;
export type GuildConfigRecord = Record<string, GuildConfig>;
export type UserConfigRecord = Record<string, UserConfig>;

type ValueResolvable<T> = T | ((value: T) => T);
export type ValueResolvableOptional<T> = T | undefined | ((value: T | undefined) => T | undefined);

const logger = getLogger("configManager");

export class ConfigManager {
  private readonly yosuga: YosugaClient;
  protected masterConfigStore: MasterConfigStore;
  protected guildConfigStore: GuildConfigStore;
  protected userConfigStore: UserConfigStore;

  constructor(
    yosuga: YosugaClient,
    configStores: {
      master: MasterConfigStore;
      guild: GuildConfigStore;
      user: UserConfigStore;
    }
  ) {
    this.yosuga = yosuga;
    this.masterConfigStore = configStores.master;
    this.guildConfigStore = configStores.guild;
    this.userConfigStore = configStores.user;
  }

  private getAppId() {
    const appId = this.yosuga.client.application?.id;
    assert(appId);
    return appId;
  }

  getMasterConfigAccessor(): ConfigAccessor<MasterConfig> {
    const appId = this.getAppId();
    return new MasterConfigAccessor({
      store: this.masterConfigStore,
      appId: appId,
    });
  }

  getGuildConfigAccessor(guildId: Snowflake): ConfigAccessor<GuildConfig> {
    return new GuildConfigAccessor({
      store: this.guildConfigStore,
      guildId: guildId,
    });
  }

  getUserConfigAccessor(userId: Snowflake): ConfigAccessor<UserConfig> {
    return new UserConfigAccessor({
      store: this.userConfigStore,
      userId: userId,
    });
  }

  getUnifiedConfigAccessor(guildId?: Snowflake, userId?: Snowflake): UnifiedConfigAccessor {
    return new UnifiedConfigAccessor({
      master: {
        store: this.masterConfigStore,
        appId: this.getAppId(),
      },
      guild: {
        store: this.guildConfigStore,
        guildId: guildId,
      },
      user: {
        store: this.userConfigStore,
        userId: userId,
      },
    });
    //readonlyAccessorのほうがいいかも？
  }

  getValidVoiceConfigAccessor(
    speakerCollection: Collection<string, Speaker>,
    guildId?: Snowflake,
    userId?: Snowflake
  ): ValidVoiceConfigAccessor {
    return new ValidVoiceConfigAccessor(
      {
        master: {
          store: this.masterConfigStore,
          appId: this.getAppId(),
        },
        guild: {
          store: this.guildConfigStore,
          guildId: guildId,
        },
        user: {
          store: this.userConfigStore,
          userId: userId,
        },
      },
      speakerCollection
    );
  }
}

export const masterConfigDefault: Readonly<UnifiedConfig> = {
  speakerBuildOptions: {},

  commandPrefix: "yosuga",
  ignorePrefix: "!!",
  masterVolume: 1,
  masterSpeed: 1.1,
  fastSpeedScale: 1.5,
  readStatusUpdate: true,
  readTimeSignal: false,
  timeToAutoLeaveSec: 10,
  timeToReadMemberNameSec: 30,
  maxStringLength: 80,

  speakerOption: {
    speakerName: "null",
    voiceParam: {
      pitch: 1,
      intonation: 1,
    },
  },
};
