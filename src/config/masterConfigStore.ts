import { Snowflake } from "discord.js";

import { MasterConfig } from "./configManager";

export interface MasterConfigStore {
  save(appId: Snowflake, value: Partial<MasterConfig>): Promise<Readonly<MasterConfig>>;
  read(appId: Snowflake): Promise<Readonly<MasterConfig>>;
}
