import { CommandInteraction } from "discord.js";

import { ConfigEachLevel, GuildLevel, MasterLevel } from "../../../config/typesConfig";
import { YosugaClient } from "../../../yosugaClient";
import { SetConfigSubCommandHandler } from "../../base/setConfigSubCommandHandler";
import { SubCommandProps } from "../../base/subCommandHandler";

export class SetIgnorePrefixSub extends SetConfigSubCommandHandler<
  MasterLevel | GuildLevel,
  "ignorePrefix"
> {
  constructor(yosuga: YosugaClient, level: MasterLevel | GuildLevel) {
    super(yosuga, level, "ignorePrefix");
  }

  protected initCommandProps(): SubCommandProps {
    return {
      name: "ignore-prefix",
      description: "読み上げを無視する接頭辞",
      options: [
        {
          name: "prefix",
          description: "接頭辞",
          type: "STRING",
          required: true,
        },
      ],
      permission: this.getPermissionLevel(),
    };
  }

  protected async getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue: Readonly<ConfigEachLevel<MasterLevel | GuildLevel>["ignorePrefix"]> | undefined
  ): Promise<ConfigEachLevel<MasterLevel | GuildLevel>["ignorePrefix"] | undefined> {
    return options.getString("value") || undefined;
  }
}
