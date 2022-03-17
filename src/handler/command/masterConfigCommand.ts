import { CommandPermission } from "../../application/permission";
import { CommandProps } from "../base/commandHandler";
import { GroupCommandHandler } from "../base/groupCommandHandler";

export class MasterConfigCommand extends GroupCommandHandler {
  protected initCommandProps(): CommandProps {
    return {
      name: "master-config",
      description: "Yosugaインスタンス全体の設定を変更する.",
      permission: CommandPermission.AppOwner,
    };
  }
}
