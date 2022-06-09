import type { UserId } from "../../types";
import type { UserConfig } from "../typesConfig";

export interface UserConfigStore {
  save(userId: UserId, value: Partial<UserConfig>): Promise<Readonly<Partial<UserConfig>>>;
  read(userId: UserId): Promise<Readonly<Partial<UserConfig>>>;
}
