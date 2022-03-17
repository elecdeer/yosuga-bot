import { Message } from "discord.js";

import {
  constructApplicationCommandsData,
  registerApplicationCommands,
} from "../../application/commandRegister";
import { CommandPermission } from "../../application/permission";
import { constructEmbeds } from "../../util/createEmbed";
import { YosugaClient } from "../../yosugaClient";
import { EventKeysUnion, Handler } from "../base/handler";
import { composeFilter, EventFilterGenerator } from "../filter/eventFilter";
import { textCommandFilter } from "../filter/textCommandFilter";
import { loadCommands } from "../handlerLoader";

export class DeployGlobalHandler extends Handler<["messageCreate"]> {
  constructor(yosuga: YosugaClient) {
    super(["messageCreate"], yosuga);
  }

  protected override filter(
    eventName: EventKeysUnion<["messageCreate"]>
  ): ReturnType<EventFilterGenerator<EventKeysUnion<["messageCreate"]>, unknown>> {
    return composeFilter(
      super.filter(eventName),
      textCommandFilter({
        prefix: "deploy global",
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
      const commandList = loadCommands(this.yosuga.client, this.yosuga);
      const commandDataList = constructApplicationCommandsData(commandList);
      await registerApplicationCommands(this.yosuga.client, commandDataList);

      const embed = constructEmbeds("plain", "正常に登録が完了しました.");
      await message.reply({
        embeds: embed,
      });
    } catch (e) {
      const embed = constructEmbeds("warn", "登録中にエラーが発生しました.");
      await message.reply({
        embeds: embed,
      });
    }
  }
}
