import { ConfigAccessor } from "./configAccessor";
import { resolveValue } from "../../util/resolvable";

import type { AppId } from "../../types";
import type { ValueResolvable } from "../../util/resolvable";
import type { MasterConfigStore } from "../store/masterConfigStore";
import type { MasterConfig } from "../typesConfig";
import type { ReadonlyDeep } from "type-fest";

export type MasterConfigAccessorProps = {
  store: MasterConfigStore;
  appId: AppId;
};

export class MasterConfigAccessor extends ConfigAccessor<MasterConfig> {
  private readonly store: MasterConfigStore;
  private readonly appId: AppId;

  constructor({ store, appId }: MasterConfigAccessorProps) {
    super();
    this.store = store;
    this.appId = appId;
  }

  async set<T extends keyof MasterConfig>(
    key: T,
    value: ValueResolvable<MasterConfig[T] | undefined>
  ): Promise<Readonly<MasterConfig[T] | undefined>> {
    const base = await this.store.read(this.appId);

    const valueResolved = resolveValue(value, base[key] as MasterConfig[T] | undefined);

    const savedConfig = await this.store.save(this.appId, {
      ...base,
      [key]: valueResolved,
    });

    return savedConfig[key] as MasterConfig[T] | undefined;
  }

  async get<T extends keyof MasterConfig>(key: T): Promise<Readonly<MasterConfig[T] | undefined>> {
    const config = await this.store.read(this.appId);
    return config[key] as MasterConfig[T] | undefined;
  }

  async getAllValue(): Promise<ReadonlyDeep<Partial<MasterConfig>>> {
    return await this.store.read(this.appId);
  }
}
