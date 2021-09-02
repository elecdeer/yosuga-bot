import { kvsLocalStorage } from "@kvs/node-localstorage";
import { KVS } from "@kvs/types";
import assert from "assert";
import deepmerge from "deepmerge";
import { Snowflake } from "discord.js";
import { getLogger } from "log4js";
import path from "path";
import { ValueOf } from "type-fest";

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
  speakerOption: SpeakerOption | null;
};

export type UnifiedConfig = MasterLevelConfig & GuildLevelConfig & UserLevelConfig;

//DISCORD_APP_ID: ConfigUnity
export type MasterConfig = Record<string, UnifiedConfig>;
export type GuildConfig = Record<string, Partial<GuildLevelConfig & UserLevelConfig>>;
export type UserConfig = Record<string, Partial<UserLevelConfig>>;

type ValueResolvable<T> = Exclude<T, undefined> | ((value: T) => Exclude<T, undefined>);
type ValueResolvableOptional<T> = T | ((value: T | undefined) => T | undefined);

const logger = getLogger("configManager");

export class ConfigManager {
  private readonly yosuga: YosugaClient;
  protected masterStorage: KVS<MasterConfig> | null;
  protected guildStorage: KVS<GuildConfig> | null;
  protected userStorage: KVS<UserConfig> | null;

  constructor(yosuga: YosugaClient) {
    this.yosuga = yosuga;
    this.masterStorage = null;
    this.guildStorage = null;
    this.userStorage = null;
  }

  async getMasterConfig(): Promise<ValueOf<MasterConfig>> {
    const appId = this.yosuga.client.application?.id;
    assert(appId);
    assert(this.masterStorage);
    const config = await this.masterStorage.get(appId);
    return config ?? masterConfigDefault;
  }

  async getGuildConfig(guildId: Snowflake): Promise<ValueOf<GuildConfig> | undefined> {
    assert(this.guildStorage);
    return await this.guildStorage.get(guildId);
  }

  async getUserConfig(userId: Snowflake): Promise<ValueOf<UserConfig> | undefined> {
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

  async setMasterConfig<T extends keyof ValueOf<MasterConfig>>(
    key: T,
    value: ValueResolvable<ValueOf<MasterConfig>[T]>
  ): Promise<boolean> {
    const appId = this.yosuga.client.application!.id;
    assert(this.masterStorage);
    const base = (await this.masterStorage.get(appId))!;

    if (typeof value === "function") {
      base[key] = value(base[key]);
    } else {
      base[key] = value;
    }

    await this.masterStorage.set(appId, base);
    return true;
  }

  async setGuildConfig<T extends keyof ValueOf<GuildConfig>>(
    guildId: Snowflake,
    key: T,
    value: ValueResolvableOptional<ValueOf<GuildConfig>[T]>
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

  async setUserConfig<T extends keyof ValueOf<UserConfig>>(
    userId: Snowflake,
    key: T,
    value: ValueResolvableOptional<ValueOf<GuildConfig>[T]>
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
    this.masterStorage = await kvsLocalStorage<MasterConfig>({
      name: "master-config",
      storeFilePath: path.join(yosugaEnv.configPath, "masterConfig"),
      version: 1,
      async upgrade({ kvs, oldVersion }) {
        if (oldVersion === 0) {
          await kvs.set(appId, masterConfigDefault);
        }
      },
    });

    this.guildStorage = await kvsLocalStorage<GuildConfig>({
      name: "guild-config",
      storeFilePath: path.join(yosugaEnv.configPath, "guildConfig"),
      version: 1,
    });

    this.userStorage = await kvsLocalStorage<UserConfig>({
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

  speakerOption: null,
};
