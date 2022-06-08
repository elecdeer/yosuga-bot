import { getLogger } from "log4js";

import { resolveValue } from "../../util/resolvable";
import { ConfigAccessor } from "./configAccessor";

import type { UserId } from "../../types";
import type { ValueResolvable } from "../../util/resolvable";
import type { UserConfigStore } from "../store/userConfigStore";
import type { UserConfig } from "../typesConfig";
import type { ReadonlyDeep } from "type-fest";

export type UserConfigAccessorProps = {
  store: UserConfigStore;
  userId: UserId;
};

const logger = getLogger("userConfigAccessor");

export class UserConfigAccessor extends ConfigAccessor<UserConfig> {
  private readonly store: UserConfigStore;
  private readonly userId: UserId;

  constructor({ store, userId }: UserConfigAccessorProps) {
    super();
    this.store = store;
    this.userId = userId;
  }

  async set<T extends keyof UserConfig>(
    key: T,
    value: ValueResolvable<UserConfig[T] | undefined>
  ): Promise<Readonly<UserConfig[T] | undefined>> {
    const base = await this.store.read(this.userId);

    const valueResolved = resolveValue(value, base[key]);

    const savedConfig = await this.store.save(this.userId, {
      ...base,
      [key]: valueResolved,
    });

    //as無いと怒られる
    return savedConfig[key] as UserConfig[T] | undefined;
  }

  async get<T extends keyof UserConfig>(key: T): Promise<Readonly<UserConfig[T]> | undefined> {
    const config = await this.store.read(this.userId);
    return config[key] as UserConfig[T] | undefined;
  }

  async getAllValue(): Promise<Partial<ReadonlyDeep<UserConfig>>> {
    const result = await this.store.read(this.userId);
    logger.debug(result);
    return result;
  }

  // async set<T extends keyof UserConfig>(
  //   key: T,
  //   value: ValueResolvableOptional<UserConfig[T]>
  // ): Promise<Readonly<UserConfig[T]>> {
  //   const base = await this.store.read(this.userId);
  //
  //   const valueResolved = typeof value === "function" ? value(base[key]) : value;
  //
  //   const savedConfig = await this.store.save(this.userId, {
  //     ...base,
  //     [key]: valueResolved,
  //   });
  //
  //   return savedConfig[key];
  // }
  //
  // async get<T extends keyof UserConfig>(key: T): Promise<Readonly<UserConfig[T]> | undefined> {
  //   const config = await this.store.read(this.userId);
  //   return config[key];
  // }
  //
  // async getAllValue(): Promise<ReadonlyDeep<Partial<UserLevelConfig>>> {
  //   const result = await this.store.read(this.userId);
  //   logger.debug(result);
  //   return result;
  // }
}
