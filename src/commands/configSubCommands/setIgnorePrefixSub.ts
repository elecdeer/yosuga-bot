import { CommandInteractionOptionResolver } from "discord.js";

import { GuildConfig, GuildLevel, MasterLevel } from "../../config/typesConfig";
import { SetConfigSubCommand, isRequiredOption } from "./setConfigSubCommand";

export class SetIgnorePrefixSub extends SetConfigSubCommand<
  MasterLevel | GuildLevel,
  "ignorePrefix"
> {
  constructor(level: MasterLevel | GuildLevel) {
    super(
      {
        name: "ignore-prefix",
        description: "読み上げを無視する接頭辞",
        options: [
          {
            name: "prefix",
            description: "接頭辞",
            type: "STRING",
            required: isRequiredOption(level),
          },
        ],
      },
      level,
      "ignorePrefix"
    );
  }

  override getValueFromOptions(
    options: CommandInteractionOptionResolver,
    oldValue: Readonly<GuildConfig["ignorePrefix"]> | undefined
  ): GuildConfig["ignorePrefix"] | undefined {
    return options.getString("prefix") || undefined;
  }
}
