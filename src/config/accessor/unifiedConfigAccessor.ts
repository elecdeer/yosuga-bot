import deepmerge from "deepmerge";
import { ReadonlyDeep, SetOptional } from "type-fest";

import { AppId, GuildId, UserId } from "../../types";
import { GuildConfigStore } from "../store/guildConfigStore";
import { MasterConfigStore } from "../store/masterConfigStore";
import { UserConfigStore } from "../store/userConfigStore";
import { MasterConfig, UnifiedConfig } from "../typesConfig";
import { GuildConfigAccessorProps } from "./guildConfigAccessor";
import { MasterConfigAccessorProps } from "./masterConfigAccessor";
import { ReadOnlyConfigAccessor } from "./readOnlyConfigAccessor";
import { UserConfigAccessorProps } from "./userConfigAccessor";

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

    if (this.guildId) {
      const guildConfig = await this.guildStore.read(this.guildId);
      if (guildConfig) {
        unifiedConfig = deepmerge<UnifiedConfig>(unifiedConfig, guildConfig);
      }
    }

    if (this.userId) {
      const userConfig = await this.userStore.read(this.userId);
      if (userConfig) {
        unifiedConfig = deepmerge<UnifiedConfig>(unifiedConfig, userConfig);
      }
    }

    return unifiedConfig;
  }
}

const defaultConfig = {
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
} as const;
