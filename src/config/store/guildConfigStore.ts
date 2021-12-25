import { Snowflake } from "discord.js";

import { GuildConfig } from "../configManager";

export interface GuildConfigStore {
  save(guildId: Snowflake, value: GuildConfig): Promise<Readonly<GuildConfig>>;
  read(guildId: Snowflake): Promise<Readonly<GuildConfig>>;
}
