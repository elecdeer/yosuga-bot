import { ApplicationCommandSubCommandData, CommandInteraction, MessageEmbed } from "discord.js";
import { ValueOf } from "type-fest";

import { CommandContextSlash } from "../../commandContextSlash";
import { stringifyConfigEntry } from "../../config/conifgUtil";
import {
  ConfigCommandLevel,
  GuildConfig,
  LevelConfigMap,
  MasterConfig,
  UnifiedConfig,
  UserConfig,
} from "../../config/typesConfig";
import { ConfigSubCommand } from "./configSubCommand";

const levelString: Record<ConfigCommandLevel, string> = {
  MASTER: "Yosugaインスタンス",
  GUILD: "サーバ",
  USER: "ユーザ",
};

export type ValidationResult =
  | { status: "valid" }
  | { status: "warn"; message: string }
  | { status: "error"; message: string };

export abstract class SetConfigSubCommand<
  TConfig extends MasterConfig | GuildConfig | UserConfig,
  TKey extends keyof TConfig
> extends ConfigSubCommand<TConfig> {
  protected readonly configKey: TKey;

  protected constructor(
    data: Omit<ApplicationCommandSubCommandData, "type">,
    level: LevelConfigMap<TConfig>,
    configKey: TKey
  ) {
    super(data, level);
    this.configKey = configKey;
  }

  protected abstract getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue: Readonly<TConfig[TKey]> | undefined
  ): TConfig[TKey] | undefined;

  protected async validateValue(
    value: TConfig[TKey] | undefined,
    context: Omit<CommandContextSlash, "reply">
  ): Promise<ValidationResult> {
    return {
      status: "valid",
    };
  }

  override async execute(context: CommandContextSlash): Promise<void> {
    const accessor = this.getConfigAccessor(context);
    const oldValue = await accessor.get(this.configKey);

    const options = context.getOptions();
    const optionValue = this.getValueFromOptions(options, oldValue);

    const validateResult = await this.validateValue(optionValue, context);
    if (validateResult.status === "warn") {
      await context.reply("warn", validateResult.message);
    }
    if (validateResult.status === "error") {
      await context.reply("error", validateResult.message);
      return;
    }

    const newValue = await accessor.set(this.configKey, optionValue);

    await context.reply("plain", this.constructReplyEmbed(oldValue, newValue));
  }

  protected constructReplyEmbed(
    oldValue: ValueOf<UnifiedConfig> | undefined,
    newValue: ValueOf<UnifiedConfig> | undefined
  ): MessageEmbed {
    console.log(oldValue);
    console.log(newValue);
    const embed = new MessageEmbed();
    embed.setDescription(`${levelString[this.level]}の設定を変更しました.`);
    embed.addField(this.data.name, this.data.description, true);
    embed.addField(
      "変更前",
      oldValue ? stringifyConfigEntry(this.configKey as string, oldValue).value : "[デフォルト値]",
      true
    );
    embed.addField(
      "変更後",
      newValue ? stringifyConfigEntry(this.configKey as string, newValue).value : "[デフォルト値]",
      true
    );
    return embed;
  }
}

export const isRequiredOption = (level: ConfigCommandLevel): boolean => {
  return false;
};
