import deepmerge from "deepmerge";

import { ReadOnlyConfigAccessor } from "./readOnlyConfigAccessor";

import type { GuildConfigAccessorProps } from "./guildConfigAccessor";
import type { MasterConfigAccessorProps } from "./masterConfigAccessor";
import type { UserConfigAccessorProps } from "./userConfigAccessor";
import type { AppId, GuildId, UserId } from "../../types";
import type { GuildConfigStore } from "../store/guildConfigStore";
import type { MasterConfigStore } from "../store/masterConfigStore";
import type { UserConfigStore } from "../store/userConfigStore";
import type { MasterConfig, UnifiedConfig } from "../typesConfig";
import type { ReadonlyDeep, SetOptional } from "type-fest";

export type UnifiedConfigAccessorProps = {
  master: MasterConfigAccessorProps;
  guild: SetOptional<GuildConfigAccessorProps, "guildId">;
  user: SetOptional<UserConfigAccessorProps, "userId">;
};

export class UnifiedConfigAccessor extends ReadOnlyConfigAccessor<UnifiedConfig, false> {
  private readonly masterStore: MasterConfigStore;
  private readonly guildStore: GuildConfigStore;
  private readonly userStore: UserConfigStore;
  private readonly appId: AppId;
  private readonly guildId?: GuildId;
  private readonly userId?: UserId;

  constructor({ master, guild, user }: UnifiedConfigAccessorProps) {
    super();
    this.masterStore = master.store;
    this.guildStore = guild.store;
    this.userStore = user.store;
    this.appId = master.appId;
    this.guildId = guild.guildId;
    this.userId = user.userId;
  }

  async get<T extends keyof UnifiedConfig>(key: T): Promise<UnifiedConfig[T]> {
    const config = await this.getAllValue();
    return config[key];
  }

  async getAllValue(): Promise<ReadonlyDeep<UnifiedConfig>> {
    let unifiedConfig: MasterConfig = {
      ...defaultConfig,
    };

    const masterConfig = await this.masterStore.read(this.appId);
    unifiedConfig = deepmerge<UnifiedConfig>(unifiedConfig, masterConfig);

    if (this.guildId !== undefined) {
      const guildConfig = await this.guildStore.read(this.guildId);
      unifiedConfig = deepmerge<UnifiedConfig>(unifiedConfig, guildConfig);
    }

    if (this.userId !== undefined) {
      const userConfig = await this.userStore.read(this.userId);
      unifiedConfig = deepmerge<UnifiedConfig>(unifiedConfig, userConfig);
    }

    return unifiedConfig;
  }
}

const defaultConfig: UnifiedConfig = {
  speakerBuildOptions: {},
  ignorePrefix: "!!",
  masterVolume: 1,
  masterSpeed: 1.1,
  fastSpeedScale: 1.5,
  readStatusUpdate: true,
  readTimeSignal: false,
  timeToAutoLeaveSec: 10,
  timeToReadMemberNameSec: 30,
  maxStringLength: 80,
  speakerName: "null",
  speakerPitch: 1,
  speakerIntonation: 1,
} as const;
