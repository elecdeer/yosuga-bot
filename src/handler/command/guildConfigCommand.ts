import { CommandPermission } from "../../application/permission";
import { CommandProps } from "../base/commandHandler";
import { GroupCommandHandler } from "../base/groupCommandHandler";

export class GuildConfigCommand extends GroupCommandHandler {
  protected initCommandProps(): CommandProps {
    return {
      name: "guild-config",
      description: "サーバレベルの設定を変更する.",
      permission: CommandPermission.GuildAdmin,
    };
  }
}
