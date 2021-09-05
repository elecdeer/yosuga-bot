import {
  ApplicationCommandSubCommandData,
  CommandInteractionOptionResolver,
  MessageEmbed,
} from "discord.js";
import { ValueOf } from "type-fest";

import { CommandContextSlash } from "../../commandContextSlash";
import { ConfigManager, GuildConfig, MasterConfig, UnifiedConfig } from "../../configManager";
import { SubCommandBase } from "../subCommandBase";

export type ConfigCommandLevel = "MASTER" | "GUILD" | "USER";

const levelString: Record<ConfigCommandLevel, string> = {
  MASTER: "Yosugaインスタンス",
  GUILD: "サーバ",
  USER: "ユーザ",
};

export abstract class ConfigSubCommand extends SubCommandBase {
  readonly level: ConfigCommandLevel;

  protected constructor(
    data: Omit<ApplicationCommandSubCommandData, "type">,
    level: ConfigCommandLevel
  ) {
    super(data);
    this.level = level;
  }

  constructReplyEmbed(
    oldValue: ValueOf<UnifiedConfig> | undefined,
    newValue: ValueOf<UnifiedConfig> | undefined
  ): MessageEmbed {
    console.log(oldValue);
    console.log(newValue);
    const embed = new MessageEmbed();
    embed.setDescription(`${levelString[this.level]}の設定を変更しました.`);
    embed.addField(this.data.name, this.data.description, true);
    embed.addField("変更前", oldValue ? String(oldValue) : "[デフォルト値]", true);
    embed.addField("変更後", newValue ? String(newValue) : "[デフォルト値]", true);
    return embed;
  }
}

export const isRequiredOption = (level: ConfigCommandLevel): boolean => {
  return false;
};
