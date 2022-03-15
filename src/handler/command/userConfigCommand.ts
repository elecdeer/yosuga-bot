import { CommandPermission } from "../../application/permission";
import { CommandProps } from "../base/commandHandler";
import { GroupCommandHandler } from "../base/groupCommandHandler";

export class UserConfigCommand extends GroupCommandHandler {
  protected initCommandProps(): CommandProps {
    return {
      name: "user-config",
      description: "ユーザレベルの設定を変更",
      permission: CommandPermission.Everyone,
    };
  }
}
