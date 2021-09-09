import { Snowflake } from "discord.js";
import { ReadonlyDeep } from "type-fest";

import { ConfigAccessor } from "./configAccessor";
import { GuildConfig, ValueResolvableOptional } from "./configManager";
import { GuildConfigStore } from "./guildConfigStore";

export type GuildConfigAccessorProps = {
  store: GuildConfigStore;
  guildId: Snowflake;
};

export class GuildConfigAccessor extends ConfigAccessor<GuildConfig> {
  private readonly store: GuildConfigStore;
  private readonly guildId: Snowflake;

  constructor({ store, guildId }: GuildConfigAccessorProps) {
    super();
    this.store = store;
    this.guildId = guildId;
  }

  async set<T extends keyof GuildConfig>(
    key: T,
    value: ValueResolvableOptional<GuildConfig[T]>
  ): Promise<Readonly<GuildConfig[T]>> {
    const base = await this.store.read(this.guildId);

    const valueResolved = typeof value === "function" ? value(base[key]) : value;

    const savedConfig = await this.store.save(this.guildId, {
      ...base,
      [key]: valueResolved,
    });

    return savedConfig[key];
  }

  async get<T extends keyof GuildConfig>(key: T): Promise<Readonly<GuildConfig[T] | undefined>> {
    const config = await this.store.read(this.guildId);
    return config[key];
  }

  async getAllValue(): Promise<ReadonlyDeep<GuildConfig>> {
    return this.store.read(this.guildId);
  }
}
