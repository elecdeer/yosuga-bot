import { GuildId } from "../../types";
import { GuildConfig } from "../typesConfig";

export interface GuildConfigStore {
  save(guildId: GuildId, value: Partial<GuildConfig>): Promise<Readonly<Partial<GuildConfig>>>;
  read(guildId: GuildId): Promise<Readonly<Partial<GuildConfig>>>;
}
