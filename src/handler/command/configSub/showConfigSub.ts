import { CommandPermission } from "../../../application/permission";
import { CommandContext } from "../../../commandContext";
import { SubCommandHandler, SubCommandProps } from "../../base/subCommandHandler";

export class ShowConfigSub extends SubCommandHandler {
  protected initCommandProps(): SubCommandProps {
    return {
      name: "show",
      description: "現在の設定を表示",
      permission: CommandPermission.Everyone,
    };
  }

  async execute(context: CommandContext): Promise<void> {
    this.logger.debug(`sub show command`);
    await context.reply("plain", "ok!");
  }
}
