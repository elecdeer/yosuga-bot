import { Snowflake } from "discord.js";

import { GuildConfig, GuildConfigRecord } from "../configManager";
import { GuildConfigStore } from "./guildConfigStore";
import { KvsStoreBase, StoreProps } from "./kvsStoreBase";

export class KvsGuildConfigStore
  extends KvsStoreBase<GuildConfigRecord>
  implements GuildConfigStore
{
  constructor(props: StoreProps) {
    super(props, 1);
  }

  read(guildId: Snowflake): Promise<Readonly<GuildConfig>> {
    return this.get(guildId);
  }

  save(guildId: Snowflake, value: GuildConfig): Promise<Readonly<GuildConfig>> {
    return this.set(guildId, value);
  }

  protected defaultValue(): GuildConfig {
    return {};
  }
}
