import { UserId } from "../../types";
import { UserConfig, UserConfigRecord } from "../configManager";
import { KvsStoreBase, StoreProps } from "./kvsStoreBase";
import { UserConfigStore } from "./userConfigStore";

export class KvsUserConfigStore extends KvsStoreBase<UserConfigRecord> implements UserConfigStore {
  constructor(props: StoreProps) {
    super(props, 1);
  }

  read(guildId: UserId): Promise<Readonly<UserConfig>> {
    return this.get(guildId);
  }

  save(guildId: UserId, value: UserConfig): Promise<Readonly<UserConfig>> {
    return this.set(guildId, value);
  }

  protected defaultValue(): UserConfig {
    return {};
  }
}
