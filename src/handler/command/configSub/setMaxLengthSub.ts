import { CommandInteraction } from "discord.js";

import { CommandContextSlash } from "../../../commandContextSlash";
import { ConfigEachLevel, GuildLevel, MasterLevel } from "../../../config/typesConfig";
import { YosugaClient } from "../../../yosugaClient";
import {
  SetConfigSubCommandHandler,
  ValidationResult,
} from "../../base/setConfigSubCommandHandler";
import { SubCommandProps } from "../../base/subCommandHandler";

export class SetMaxLengthSub extends SetConfigSubCommandHandler<
  MasterLevel | GuildLevel,
  "maxStringLength"
> {
  constructor(yosuga: YosugaClient, level: MasterLevel | GuildLevel) {
    super(yosuga, level, "maxStringLength");
  }

  protected initCommandProps(): SubCommandProps {
    return {
      name: "max-string-length",
      description: "読み上げを省略しない最大文字数を設定",
      options: [
        {
          name: "value",
          description: "文字数",
          type: "NUMBER",
          required: true,
        },
      ],
      permission: this.getPermissionLevel(),
    };
  }

  protected async getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue: Readonly<ConfigEachLevel<MasterLevel | GuildLevel>["maxStringLength"]> | undefined
  ): Promise<ConfigEachLevel<MasterLevel | GuildLevel>["maxStringLength"] | undefined> {
    return options.getNumber("value") || undefined;
  }

  protected override async validateValue(
    value: ConfigEachLevel<MasterLevel | GuildLevel>["maxStringLength"] | undefined,
    context: Omit<CommandContextSlash, "reply">
  ): Promise<ValidationResult> {
    if (value && value < 0) {
      return {
        status: "error",
        message: "設定する値は整数である必要があります.",
      };
    }
    return super.validateValue(value, context);
  }
}
