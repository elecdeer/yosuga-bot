import { kvsLocalStorage } from "@kvs/node-localstorage";
import { KVS } from "@kvs/types";
import assert from "assert";
import deepmerge from "deepmerge";
import { Snowflake } from "discord.js";
import { getLogger } from "log4js";
import path from "path";

import { yosugaEnv } from "./environment";
import { SpeakerBuildOption } from "./speaker/voiceProvider";
import { SpeakerOption } from "./types";
import { YosugaClient } from "./yosugaClient";

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

//DISCORD_APP_ID: ConfigUnity
export type MasterConfigRecord = Record<string, MasterConfig>;
export type GuildConfigRecord = Record<string, GuildConfig>;
export type UserConfigRecord = Record<string, UserConfig>;

type ValueResolvable<T> = T | ((value: T) => T);
export type ValueResolvableOptional<T> = T | undefined | ((value: T | undefined) => T | undefined);

const logger = getLogger("configManager");

export class ConfigManager {
  private readonly yosuga: YosugaClient;
  protected masterStorage: KVS<MasterConfigRecord> | null;
  protected guildStorage: KVS<GuildConfigRecord> | null;
  protected userStorage: KVS<UserConfigRecord> | null;

  constructor(yosuga: YosugaClient) {
    this.yosuga = yosuga;
    this.masterStorage = null;
    this.guildStorage = null;
    this.userStorage = null;
  }

  async getMasterConfig(): Promise<MasterConfig> {
    const appId = this.yosuga.client.application?.id;
    assert(appId);
    assert(this.masterStorage);
    const config = await this.masterStorage.get(appId);
    return config ?? masterConfigDefault;
  }

  async getGuildConfig(guildId: Snowflake): Promise<GuildConfig | undefined> {
    assert(this.guildStorage);
    return await this.guildStorage.get(guildId);
  }

  async getUserConfig(userId: Snowflake): Promise<UserConfig | undefined> {
    assert(this.userStorage);
    return await this.userStorage.get(userId);
  }

  async getUnifiedConfig(guildId?: Snowflake, userId?: Snowflake): Promise<UnifiedConfig> {
    let unifiedConfig = await this.getMasterConfig();

    if (guildId) {
      const guildConfig = await this.getGuildConfig(guildId);
      if (guildConfig) {
        unifiedConfig = deepmerge<UnifiedConfig>(unifiedConfig, guildConfig);
      }
    }

    if (userId) {
      const userConfig = await this.getUserConfig(userId);
      if (userConfig) {
        unifiedConfig = deepmerge<UnifiedConfig>(unifiedConfig, userConfig);
      }
    }

    return unifiedConfig;
  }

  async setConfig<T extends keyof UnifiedConfig>(
    accessor:
      | { level: "MASTER" }
      | { level: "GUILD"; guildId: Snowflake }
      | { level: "USER"; userId: Snowflake },
    key: T,
    value: ValueResolvableOptional<UnifiedConfig[T]>
  ): Promise<boolean> {
    if (accessor.level === "MASTER") {
      return this.setMasterConfig(key, value);
    }

    if (accessor.level === "GUILD") {
      return this.setGuildConfig(accessor.guildId, key, value);
    }

    if (accessor.level === "USER") {
      return this.setUserConfig(accessor.userId, key, value);
    }

    //never
    return false;
  }

  async setMasterConfig<T extends keyof MasterConfig>(
    key: T,
    value: ValueResolvableOptional<MasterConfig[T]>
  ): Promise<boolean> {
    const appId = this.yosuga.client.application!.id;
    assert(this.masterStorage);
    const base = (await this.masterStorage.get(appId)) ?? masterConfigDefault;

    if (typeof value === "function") {
      base[key] = value(base[key]) ?? masterConfigDefault[key];
    } else {
      base[key] = value ?? masterConfigDefault[key];
    }

    await this.masterStorage.set(appId, base);
    return true;
  }

  async setGuildConfig<T extends keyof GuildConfig>(
    guildId: Snowflake,
    key: T,
    value: ValueResolvableOptional<GuildConfig[T]>
  ): Promise<boolean> {
    assert(this.guildStorage);
    const base = (await this.guildStorage.get(guildId)) ?? {};

    if (typeof value === "function") {
      base[key] = value(base[key]);
    } else {
      base[key] = value;
    }

    await this.guildStorage.set(guildId, base);

    return true;
  }

  async setUserConfig<T extends keyof UserConfig>(
    userId: Snowflake,
    key: T,
    value: ValueResolvableOptional<UserConfig[T]>
  ): Promise<boolean> {
    assert(this.userStorage);
    const base = (await this.userStorage.get(userId)) ?? {};

    if (typeof value === "function") {
      base[key] = value(base[key]);
    } else {
      base[key] = value;
    }

    await this.userStorage.set(userId, base);
    return true;
  }

  async initialize(): Promise<void> {
    logger.debug("initialize configManager");
    const appId = this.yosuga.client.application!.id;
    this.masterStorage = await kvsLocalStorage<MasterConfigRecord>({
      name: "master-config",
      storeFilePath: path.join(yosugaEnv.configPath, "masterConfig"),
      version: 1,
      async upgrade({ kvs, oldVersion }) {
        if (oldVersion === 0) {
          await kvs.set(appId, masterConfigDefault);
        }
      },
    });

    this.guildStorage = await kvsLocalStorage<GuildConfigRecord>({
      name: "guild-config",
      storeFilePath: path.join(yosugaEnv.configPath, "guildConfig"),
      version: 1,
    });

    this.userStorage = await kvsLocalStorage<UserConfigRecord>({
      name: "user-config",
      storeFilePath: path.join(yosugaEnv.configPath, "userConfig"),
      version: 1,
    });

    // this.userStorage.set();

    logger.debug("loaded!");
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
