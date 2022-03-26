import { CommandPermission } from "../../application/permission";
import { CommandContext } from "../../commandContext";
import { YosugaClient } from "../../yosugaClient";
import { CommandHandler, CommandProps } from "../base/commandHandler";
import { endSessionFilter } from "../filter/endSessionFilter";

export class EndCommand extends CommandHandler {
  constructor(yosuga: YosugaClient) {
    super(yosuga);
  }

  protected initCommandProps(): CommandProps {
    return {
      name: "end",
      description: "ボイスチャンネルから退出し,読み上げを終了する.",
      permission: CommandPermission.Everyone,
    };
  }

  async execute(context: CommandContext): Promise<void> {
    if (!context.session?.voiceConnection) {
      await context.reply({
        type: "warn",
        content: "未接続です.",
      });
      return;
    }

    context.session.disconnect();

    const filter = endSessionFilter(context.session.voiceChannel);
    const handler = filter(async () => {
      this.yosuga.client.off("voiceStateUpdate", handler);
      await context.reply({
        content: "退出しました.",
      });
    });
    this.yosuga.client.on("voiceStateUpdate", handler);
  }
}
