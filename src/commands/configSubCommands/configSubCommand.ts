import { ApplicationCommandSubCommandData } from "discord.js";

import { CommandContext } from "../../commandContext";
import { ConfigAccessor } from "../../config/accessor/configAccessor";
import { ConfigCommandLevel, ConfigEachLevel } from "../../config/typesConfig";
import { SubCommandBase } from "../subCommandBase";

export abstract class ConfigSubCommand<
  TConfigLevels extends ConfigCommandLevel
> extends SubCommandBase {
  protected readonly level: TConfigLevels;

  protected constructor(
    data: Omit<ApplicationCommandSubCommandData, "type">,
    level: TConfigLevels
  ) {
    super(data);
    this.level = level;
  }

  protected getConfigAccessor(
    context: CommandContext
  ): ConfigAccessor<ConfigEachLevel<TConfigLevels>> {
    switch (this.level) {
      case "MASTER":
        return context.configManager.getMasterConfigAccessor() as ConfigAccessor<
          ConfigEachLevel<TConfigLevels>
        >;
      case "GUILD":
        return context.configManager.getGuildConfigAccessor(context.guild.id) as ConfigAccessor<
          ConfigEachLevel<TConfigLevels>
        >;
      case "USER":
        return context.configManager.getUserConfigAccessor(context.member.id) as ConfigAccessor<
          ConfigEachLevel<TConfigLevels>
        >;
    }
    throw Error();
  }
}
