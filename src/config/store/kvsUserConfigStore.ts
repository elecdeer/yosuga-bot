import { UserId } from "../../types";
import { UserConfig, UserConfigRecord } from "../typesConfig";
import { KvsStoreBase, StoreProps } from "./kvsStoreBase";
import { UserConfigStore } from "./userConfigStore";

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
