import { CommandPermission } from "../../application/permission";
import { GroupCommandHandler } from "../base/groupCommandHandler";

import type { CommandProps } from "../base/commandHandler";

export class GuildConfigCommand extends GroupCommandHandler {
  protected initCommandProps(): CommandProps {
    return {
      name: "guild-config",
      description: "サーバレベルの設定を変更する.",
      permission: CommandPermission.GuildAdmin,
    };
  }
}
