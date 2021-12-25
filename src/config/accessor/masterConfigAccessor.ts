import { ReadonlyDeep } from "type-fest";

import { AppId } from "../../util/types";
import { MasterConfig, ValueResolvableOptional } from "../configManager";
import { MasterConfigStore } from "../store/masterConfigStore";
import { ConfigAccessor } from "./configAccessor";

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
    value: ValueResolvableOptional<MasterConfig[T]>
  ): Promise<Readonly<MasterConfig[T]>> {
    const base = await this.store.read(this.appId);

    const valueResolved = typeof value === "function" ? value(base[key]) : value;

    const savedConfig = await this.store.save(this.appId, {
      ...base,
      [key]: valueResolved,
    });

    return savedConfig[key];
  }

  async get<T extends keyof MasterConfig>(key: T): Promise<Readonly<MasterConfig[T]>> {
    const config = await this.store.read(this.appId);
    return config[key];
  }

  async getAllValue(): Promise<ReadonlyDeep<MasterConfig>> {
    return await this.store.read(this.appId);
  }
}
