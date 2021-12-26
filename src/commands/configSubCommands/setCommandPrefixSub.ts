import { CommandInteractionOptionResolver } from "discord.js";

import { GuildConfig, GuildLevel, MasterLevel } from "../../config/typesConfig";
import { SetConfigSubCommand, isRequiredOption } from "./setConfigSubCommand";

export class SetCommandPrefixSub extends SetConfigSubCommand<
  MasterLevel | GuildLevel,
  "commandPrefix"
> {
  constructor(level: MasterLevel | GuildLevel) {
    super(
      {
        name: "command-prefix",
        description: "テキストコマンドの呼び出し接頭辞の設定",
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
      "commandPrefix"
    );
  }

  override getValueFromOptions(
    options: CommandInteractionOptionResolver,
    oldValue: Readonly<GuildConfig["commandPrefix"]> | undefined
  ): GuildConfig["commandPrefix"] | undefined {
    return options.getString("prefix") || undefined;
  }
}
