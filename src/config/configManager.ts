import assert from "assert";
import { Collection } from "discord.js";
import { getLogger } from "log4js";

import { Speaker } from "../speaker/speaker";
import { SpeakerBuildOption } from "../speaker/voiceProvider";
import { SpeakerOption } from "../types";
import { GuildId, UserId } from "../util/types";
import { YosugaClient } from "../yosugaClient";
import { ConfigAccessor } from "./accessor/configAccessor";
import { GuildConfigAccessor } from "./accessor/guildConfigAccessor";
import { MasterConfigAccessor } from "./accessor/masterConfigAccessor";
import { UnifiedConfigAccessor } from "./accessor/unifiedConfigAccessor";
import { UserConfigAccessor } from "./accessor/userConfigAccessor";
import { ValidVoiceConfigAccessor } from "./accessor/validVoiceConfigAccessor";
import { GuildConfigStore } from "./store/guildConfigStore";
import { MasterConfigStore } from "./store/masterConfigStore";
import { UserConfigStore } from "./store/userConfigStore";

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

  getGuildConfigAccessor(guildId: GuildId): ConfigAccessor<GuildConfig> {
    return new GuildConfigAccessor({
      store: this.guildConfigStore,
      guildId: guildId,
    });
  }

  getUserConfigAccessor(userId: UserId): ConfigAccessor<UserConfig> {
    return new UserConfigAccessor({
      store: this.userConfigStore,
      userId: userId,
    });
  }

  getUnifiedConfigAccessor(guildId?: GuildId, userId?: UserId): UnifiedConfigAccessor {
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
    guildId?: GuildId,
    userId?: UserId
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
