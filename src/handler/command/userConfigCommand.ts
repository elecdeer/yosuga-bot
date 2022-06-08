import { CommandPermission } from "../../application/permission";
import { GroupCommandHandler } from "../base/groupCommandHandler";

import type { CommandProps } from "../base/commandHandler";

export class UserConfigCommand extends GroupCommandHandler {
  protected initCommandProps(): CommandProps {
    return {
      name: "user-config",
      description: "ユーザレベルの設定を変更する.",
      permission: CommandPermission.Everyone,
    };
  }
}
