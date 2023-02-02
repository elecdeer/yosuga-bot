import { ConfigAccessor } from "./configAccessor";
import { resolveValue } from "../../util/resolvable";

import type { GuildId } from "../../types";
import type { ValueResolvable } from "../../util/resolvable";
import type { GuildConfigStore } from "../store/guildConfigStore";
import type { GuildConfig } from "../typesConfig";
import type { ReadonlyDeep } from "type-fest";

export type GuildConfigAccessorProps = {
  store: GuildConfigStore;
  guildId: GuildId;
};

export class GuildConfigAccessor extends ConfigAccessor<GuildConfig> {
  private readonly store: GuildConfigStore;
  private readonly guildId: GuildId;

  constructor({ store, guildId }: GuildConfigAccessorProps) {
    super();
    this.store = store;
    this.guildId = guildId;
  }

  async set<T extends keyof GuildConfig>(
    key: T,
    value: ValueResolvable<GuildConfig[T] | undefined>
  ): Promise<Readonly<GuildConfig[T] | undefined>> {
    const base = await this.store.read(this.guildId);

    const valueResolved = resolveValue(value, base[key] as GuildConfig[T] | undefined);

    const savedConfig = await this.store.save(this.guildId, {
      ...base,
      [key]: valueResolved,
    });

    return savedConfig[key] as GuildConfig[T] | undefined;
  }

  async get<T extends keyof GuildConfig>(key: T): Promise<Readonly<GuildConfig[T] | undefined>> {
    const config = await this.store.read(this.guildId);
    return config[key] as GuildConfig[T] | undefined;
  }

  async getAllValue(): Promise<ReadonlyDeep<Partial<GuildConfig>>> {
    return this.store.read(this.guildId);
  }
}
