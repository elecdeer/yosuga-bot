import { Snowflake } from "discord.js";

import { UserConfig } from "../configManager";

export interface UserConfigStore {
  save(userId: Snowflake, value: UserConfig): Promise<Readonly<UserConfig>>;
  read(userId: Snowflake): Promise<Readonly<UserConfig>>;
}
