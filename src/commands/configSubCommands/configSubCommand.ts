import { ApplicationCommandSubCommandData } from "discord.js";

import { CommandContext } from "../../commandContext";
import { ConfigAccessor } from "../../config/accessor/configAccessor";
import { GuildConfig, LevelConfigMap, MasterConfig, UserConfig } from "../../config/typesConfig";
import { SubCommandBase } from "../subCommandBase";

export abstract class ConfigSubCommand<
  TConfig extends MasterConfig | GuildConfig | UserConfig
> extends SubCommandBase {
  protected readonly level: LevelConfigMap<TConfig>;

  protected constructor(
    data: Omit<ApplicationCommandSubCommandData, "type">,
    level: LevelConfigMap<TConfig>
  ) {
    super(data);
    this.level = level;
  }

  protected getConfigAccessor(context: CommandContext): ConfigAccessor<TConfig> {
    switch (this.level) {
      case "MASTER":
        return context.configManager.getMasterConfigAccessor() as unknown as ConfigAccessor<TConfig>;
      case "GUILD":
        return context.configManager.getGuildConfigAccessor(
          context.guild.id
        ) as unknown as ConfigAccessor<TConfig>;
      case "USER":
        return context.configManager.getUserConfigAccessor(
          context.member.id
        ) as unknown as ConfigAccessor<TConfig>;
    }
    throw Error();
  }
}
