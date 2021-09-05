import { KVS } from "@kvs/types";
import assert from "assert";
import { Snowflake } from "discord.js";

import {
  GuildConfigRecord,
  masterConfigDefault,
  MasterConfigRecord,
  UnifiedConfig,
  ValueResolvableOptional
} from "./configManager";
import { ConfigProperties } from "./configProperties";

export class GuildConfigProperties extends ConfigProperties {
  protected store: KVS<GuildConfigRecord>;
  protected appId: Snowflake;

  constructor(store: KVS<GuildConfigRecord>, appId: Snowflake) {
    super();
    this.store = store;
    this.appId = appId;
  }

  async get<T extends keyof UnifiedConfig>(key: T): Promise<UnifiedConfig[T] | undefined> {
    const properties = await this.store.get(this.appId);
    assert(properties);
    return properties[key];
  }

  async set<T extends keyof UnifiedConfig>(
    key: T,
    value: ValueResolvableOptional<UnifiedConfig[T]>
  ): Promise<UnifiedConfig[T]> {
    const base = (await this.store.get(this.appId)) ?? masterConfigDefault;

    if (typeof value === "function") {
      base[key] = value(base[key]) ?? masterConfigDefault[key];
    } else {
      base[key] = value ?? masterConfigDefault[key];
    }

    await this.store.set(this.appId, base);

    const result = await this.get(key);
    assert(result);

    return result;
  }
}
