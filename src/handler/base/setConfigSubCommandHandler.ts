import { MessageEmbed } from "discord.js";

import { ConfigSubCommandHandler } from "./configSubCommandHandler";
import { stringifyConfigEntry } from "../../config/conifgUtil";

import type { CommandContextSlash } from "../../commandContextSlash";
import type { ConfigCommandLevel, ConfigEachLevel, UnifiedConfig } from "../../config/typesConfig";
import type { YosugaClient } from "../../yosugaClient";
import type { CommandInteraction } from "discord.js";

export const levelString: Record<ConfigCommandLevel, string> = {
  MASTER: "Yosugaインスタンス",
  GUILD: "サーバ",
  USER: "ユーザ",
};

export type ValidationResult =
  | { status: "valid" }
  | { status: "warn"; message: string }
  | { status: "error"; message: string };

export abstract class SetConfigSubCommandHandler<
  TConfigLevels extends ConfigCommandLevel,
  TKey extends keyof ConfigEachLevel<TConfigLevels>
> extends ConfigSubCommandHandler<TConfigLevels> {
  protected readonly configKey: TKey;

  protected constructor(yosuga: YosugaClient, level: TConfigLevels, configKey: TKey) {
    super(yosuga, level);
    this.configKey = configKey;
  }

  /**
   * interactionで指定されたオプション値を取得する
   * @param options
   * @param oldValue
   * @protected
   */
  protected abstract getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue: Readonly<ConfigEachLevel<TConfigLevels>[TKey]> | undefined
  ): Promise<ConfigEachLevel<TConfigLevels>[TKey] | undefined>;

  /**
   * オプション値のバリデーションを行う
   * @param value
   * @param context
   * @protected
   */
  protected async validateValue(
    value: ConfigEachLevel<TConfigLevels>[TKey] | undefined,
    context: Omit<CommandContextSlash, "replyMulti">
  ): Promise<ValidationResult> {
    return {
      status: "valid",
    };
  }

  override async execute(context: CommandContextSlash): Promise<void> {
    const accessor = this.getConfigAccessor(context);
    const oldValue = await accessor.get(this.configKey);

    const options = context.getOptions();
    const optionValue = await this.getValueFromOptions(options, oldValue);

    const validateResult = await this.validateValue(optionValue, context);
    if (validateResult.status === "warn") {
      await context.reply({
        type: "warn",
        content: validateResult.message,
      });
    }
    if (validateResult.status === "error") {
      await context.reply({
        type: "error",
        content: validateResult.message,
      });
      return;
    }

    const newValue = await accessor.set(this.configKey, optionValue);

    await context.reply({
      content: this.constructConfigReplyEmbed(oldValue, newValue),
    });
  }

  /**
   * config設定結果を示すEmbedを生成
   * @param oldValue
   * @param newValue
   * @protected
   */
  protected constructConfigReplyEmbed(
    oldValue: Readonly<ConfigEachLevel<TConfigLevels>[TKey] | undefined>,
    newValue: Readonly<ConfigEachLevel<TConfigLevels>[TKey] | undefined>
  ): MessageEmbed {
    const embed = new MessageEmbed();
    embed.setDescription(`${levelString[this.level]}の設定を変更しました.`);
    embed.addField(this.commandProps.name, this.commandProps.description, true);

    embed.addField(
      "変更前",
      oldValue
        ? stringifyConfigEntry(this.configKey as keyof UnifiedConfig, oldValue).value
        : "[デフォルト値]",
      true
    );
    embed.addField(
      "変更後",
      newValue
        ? stringifyConfigEntry(this.configKey as keyof UnifiedConfig, newValue).value
        : "[デフォルト値]",
      true
    );
    return embed;
  }
}
