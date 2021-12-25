import { GuildId } from "../../types";
import { GuildConfig, GuildConfigRecord } from "../typesConfig";
import { GuildConfigStore } from "./guildConfigStore";
import { KvsStoreBase, StoreProps } from "./kvsStoreBase";

export class KvsGuildConfigStore
  extends KvsStoreBase<GuildConfigRecord>
  implements GuildConfigStore
{
  constructor(props: StoreProps) {
    super(props, 1);
  }

  read(guildId: GuildId): Promise<Readonly<GuildConfig>> {
    return this.get(guildId);
  }

  save(guildId: GuildId, value: GuildConfig): Promise<Readonly<GuildConfig>> {
    return this.set(guildId, value);
  }

  protected defaultValue(): GuildConfig {
    return {};
  }
}
