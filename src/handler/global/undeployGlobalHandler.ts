import { ClientEvents } from "discord.js";

import { unregisterApplicationCommand } from "../../application/commandRegister";
import { CommandPermission, fetchPermission } from "../../application/permissionUtil";
import { constructEmbeds } from "../../util/createEmbed";
import { YosugaClient } from "../../yosugaClient";
import { Handler } from "../base/handler";
import { isMessageMentionedCall } from "../filter/messageMentionFilter";

export class UndeployGlobalHandler extends Handler<["messageCreate"]> {
  constructor(yosuga: YosugaClient) {
    super(["messageCreate"], yosuga);
  }

  protected override async filter(
    eventName: "messageCreate",
    args: ClientEvents["messageCreate"]
  ): Promise<boolean> {
    const [message] = args;

    if (!message.member) return false;
    if (!isMessageMentionedCall(this.yosuga.client.user)(message)) return false;
    if (!message.cleanContent.startsWith("undeploy global")) return false;
    if ((await fetchPermission(message.member)) < CommandPermission.AppOwner) return false;
    return super.filter(eventName, args);
  }

  protected async onEvent(
    eventName: "messageCreate",
    args: ClientEvents["messageCreate"]
  ): Promise<void> {
    const [message] = args;

    try {
      await unregisterApplicationCommand(this.yosuga.client);

      const embed = constructEmbeds("plain", "正常に削除が完了しました.");
      await message.reply({
        embeds: embed,
      });
    } catch (e) {
      const embed = constructEmbeds("warn", "削除中にエラーが発生しました.");
      await message.reply({
        embeds: embed,
      });
    }
  }
}
