import { KvsStoreBase } from "./kvsStoreBase";

import type { GuildId } from "../../types";
import type { GuildConfig, GuildConfigRecord } from "../typesConfig";
import type { GuildConfigStore } from "./guildConfigStore";
import type { StoreProps } from "./kvsStoreBase";

export class KvsGuildConfigStore
  extends KvsStoreBase<GuildConfigRecord>
  implements GuildConfigStore
{
  constructor(props: StoreProps) {
    super(props, 1);
  }

  async read(guildId: GuildId): Promise<Readonly<Partial<GuildConfig>>> {
    return (await this.get(guildId)) ?? {};
  }

  async save(
    guildId: GuildId,
    value: Partial<GuildConfig>
  ): Promise<Readonly<Partial<GuildConfig>>> {
    return (await this.set(guildId, value)) ?? {};
  }
}
