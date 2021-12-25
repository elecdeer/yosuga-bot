import { GuildId } from "../../types";
import { GuildConfig } from "../configManager";

export interface GuildConfigStore {
  save(guildId: GuildId, value: GuildConfig): Promise<Readonly<GuildConfig>>;
  read(guildId: GuildId): Promise<Readonly<GuildConfig>>;
}
