import { UserId } from "../../types";
import { UserConfig } from "../typesConfig";

export interface UserConfigStore {
  save(userId: UserId, value: UserConfig): Promise<Readonly<UserConfig>>;
  read(userId: UserId): Promise<Readonly<UserConfig>>;
}
