import { CommandInteraction } from "discord.js";

import { CommandContextSlash } from "../../../commandContextSlash";
import { ValidationResult } from "../../../commands/configSubCommands/setConfigSubCommand";
import { ConfigEachLevel, GuildLevel, MasterLevel } from "../../../config/typesConfig";
import { YosugaClient } from "../../../yosugaClient";
import { SetConfigSubCommandHandler } from "../../base/setConfigSubCommandHandler";
import { SubCommandProps } from "../../base/subCommandHandler";

export class SetReadNameIntervalSub extends SetConfigSubCommandHandler<
  MasterLevel | GuildLevel,
  "timeToReadMemberNameSec"
> {
  constructor(yosuga: YosugaClient, level: MasterLevel | GuildLevel) {
    super(yosuga, level, "timeToReadMemberNameSec");
  }

  protected initCommandProps(): SubCommandProps {
    return {
      name: "read-name-interval",
      description: "連続で読み上げた場合でも名前を読み上げる様になるまでの秒数を設定",
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
    oldValue:
      | Readonly<ConfigEachLevel<MasterLevel | GuildLevel>["timeToReadMemberNameSec"]>
      | undefined
  ): Promise<ConfigEachLevel<MasterLevel | GuildLevel>["timeToReadMemberNameSec"] | undefined> {
    return options.getNumber("value") || undefined;
  }

  protected override async validateValue(
    value: ConfigEachLevel<MasterLevel | GuildLevel>["timeToReadMemberNameSec"] | undefined,
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
