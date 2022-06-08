import { KvsStoreBase } from "./kvsStoreBase";

import type { UserId } from "../../types";
import type { UserConfig, UserConfigRecord } from "../typesConfig";
import type { StoreProps } from "./kvsStoreBase";
import type { UserConfigStore } from "./userConfigStore";

export class KvsUserConfigStore extends KvsStoreBase<UserConfigRecord> implements UserConfigStore {
  constructor(props: StoreProps) {
    super(props, 1);
  }

  async read(userId: UserId): Promise<Readonly<Partial<UserConfig>>> {
    return (await this.get(userId)) ?? {};
  }

  async save(userId: UserId, value: Partial<UserConfig>): Promise<Readonly<Partial<UserConfig>>> {
    return (await this.set(userId, value)) ?? {};
  }
}
