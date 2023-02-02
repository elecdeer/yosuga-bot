import { SubCommandHandler } from "./subCommandHandler";
import { CommandPermission } from "../../application/permission";

import type { CommandContext } from "../../commandContext";
import type { ConfigAccessor } from "../../config/accessor/configAccessor";
import type { ConfigCommandLevel, ConfigEachLevel } from "../../config/typesConfig";
import type { YosugaClient } from "../../yosugaClient";

export abstract class ConfigSubCommandHandler<
  TConfigLevels extends ConfigCommandLevel
> extends SubCommandHandler {
  protected readonly level: TConfigLevels;

  public constructor(yosuga: YosugaClient, level: TConfigLevels) {
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

  /**
   * 自身のconfigレベルから権限レベルを取得
   * @protected
   */
  protected getPermissionLevel(): CommandPermission {
    switch (this.level) {
      case "MASTER":
        return CommandPermission.AppOwner;
      case "GUILD":
        return CommandPermission.GuildAdmin;
      case "USER":
        return CommandPermission.Everyone;
    }
    throw Error();
  }
}
