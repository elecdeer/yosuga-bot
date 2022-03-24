import { CommandInteraction } from "discord.js";

import { CommandContextSlash } from "../../../commandContextSlash";
import { ConfigEachLevel, GuildLevel, MasterLevel } from "../../../config/typesConfig";
import { YosugaClient } from "../../../yosugaClient";
import {
  SetConfigSubCommandHandler,
  ValidationResult,
} from "../../base/setConfigSubCommandHandler";
import { SubCommandProps } from "../../base/subCommandHandler";

export class SetAutoLeaveSecSub extends SetConfigSubCommandHandler<
  MasterLevel | GuildLevel,
  "timeToAutoLeaveSec"
> {
  constructor(yosuga: YosugaClient, level: MasterLevel | GuildLevel) {
    super(yosuga, level, "timeToAutoLeaveSec");
  }

  protected initCommandProps(): SubCommandProps {
    return {
      name: "auto-leave-time",
      description: "自動退出までの秒数を設定",
      options: [
        {
          name: "value",
          description: "秒数",
          type: "NUMBER",
          required: true,
        },
      ],
      permission: this.getPermissionLevel(),
    };
  }

  protected async getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue: Readonly<ConfigEachLevel<MasterLevel | GuildLevel>["timeToAutoLeaveSec"]> | undefined
  ): Promise<ConfigEachLevel<MasterLevel | GuildLevel>["timeToAutoLeaveSec"] | undefined> {
    return options.getNumber("value") || undefined;
  }

  protected override async validateValue(
    value: ConfigEachLevel<MasterLevel | GuildLevel>["timeToAutoLeaveSec"] | undefined,
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
