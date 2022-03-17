import { CommandContext } from "../../commandContext";
import { ConfigAccessor } from "../../config/accessor/configAccessor";
import { ConfigCommandLevel, ConfigEachLevel } from "../../config/typesConfig";
import { YosugaClient } from "../../yosugaClient";
import { SubCommandHandler } from "./subCommandHandler";

export abstract class ConfigSubCommandHandler<
  TConfigLevels extends ConfigCommandLevel
> extends SubCommandHandler {
  protected readonly level: TConfigLevels;

  protected constructor(yosuga: YosugaClient, level: TConfigLevels) {
    super(yosuga);
    this.level = level;
  }

  /**
   * 自身の権限レベルにあったconfigAccessorを取得
   * @param context
   * @protected
   */
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
