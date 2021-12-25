import { UserId } from "../../util/types";
import { UserConfig } from "../configManager";

export interface UserConfigStore {
  save(userId: UserId, value: UserConfig): Promise<Readonly<UserConfig>>;
  read(userId: UserId): Promise<Readonly<UserConfig>>;
}
