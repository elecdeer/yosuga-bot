import { CommandPermission } from "../../application/permission";
import { GroupCommandHandler } from "../base/groupCommandHandler";

import type { CommandProps } from "../base/commandHandler";

export class MasterConfigCommand extends GroupCommandHandler {
  protected initCommandProps(): CommandProps {
    return {
      name: "master-config",
      description: "Yosugaインスタンス全体の設定を変更する.",
      permission: CommandPermission.AppOwner,
    };
  }
}
