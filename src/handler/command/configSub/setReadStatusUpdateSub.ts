import { SetConfigSubCommandHandler } from "../../base/setConfigSubCommandHandler";

import type { ConfigEachLevel, GuildLevel, MasterLevel } from "../../../config/typesConfig";
import type { YosugaClient } from "../../../yosugaClient";
import type { SubCommandProps } from "../../base/subCommandHandler";
import type { CommandInteraction } from "discord.js";

export class SetReadStatusUpdateSub extends SetConfigSubCommandHandler<
  MasterLevel | GuildLevel,
  "readStatusUpdate"
> {
  constructor(yosuga: YosugaClient, level: MasterLevel | GuildLevel) {
    super(yosuga, level, "readStatusUpdate");
  }

  protected initCommandProps(): SubCommandProps {
    return {
      name: "read-status-update",
      description: "GoLiveの開始時などに読み上げるかどうかの設定",
      options: [
        {
          name: "enable",
          description: "読み上げるかどうか",
          type: "BOOLEAN",
          required: true,
        },
      ],
      permission: this.getPermissionLevel(),
    };
  }

  protected async getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue: Readonly<ConfigEachLevel<MasterLevel | GuildLevel>["readStatusUpdate"]> | undefined
  ): Promise<ConfigEachLevel<MasterLevel | GuildLevel>["readStatusUpdate"] | undefined> {
    return options.getBoolean("enable") ?? undefined;
  }
}
