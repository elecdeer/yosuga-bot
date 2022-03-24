import { Message } from "discord.js";

import { unregisterApplicationCommand } from "../../application/commandRegister";
import { CommandPermission } from "../../application/permission";
import { constructEmbeds } from "../../util/createEmbed";
import { YosugaClient } from "../../yosugaClient";
import { EventKeysUnion, Handler } from "../base/handler";
import { composeFilter, EventFilterGenerator } from "../filter/eventFilter";
import { textCommandFilter } from "../filter/textCommandFilter";

export class UndeployGlobalHandler extends Handler<["messageCreate"]> {
  constructor(yosuga: YosugaClient) {
    super(["messageCreate"], yosuga);
  }

  protected override filter(
    eventName: EventKeysUnion<["messageCreate"]>
  ): ReturnType<EventFilterGenerator<EventKeysUnion<["messageCreate"]>, unknown>> {
    return composeFilter(
      super.filter(eventName),
      textCommandFilter({
        prefix: "undeploy global",
        permission: CommandPermission.AppOwner,
        yosugaUser: this.yosuga.client.user,
      })
    );
  }

  protected override async onEvent(
    eventName: EventKeysUnion<["messageCreate"]>,
    message: Message
  ): Promise<void> {
    this.logger.debug("deployGlobal");

    try {
      await unregisterApplicationCommand(this.yosuga.client);

      const embed = constructEmbeds("plain", "正常に削除が完了しました.");
      await message.reply({
        embeds: embed,
      });
    } catch (e) {
      this.logger.error(e);
      const embed = constructEmbeds("warn", "削除中にエラーが発生しました.");
      await message.reply({
        embeds: embed,
      });
    }
  }
}
