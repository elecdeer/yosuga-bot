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

export class DeployGuildHandler extends Handler<["messageCreate"]> {
  constructor(yosuga: YosugaClient) {
    super(["messageCreate"], yosuga);
  }

  protected override filter(
    eventName: EventKeysUnion<["messageCreate"]>
  ): ReturnType<EventFilterGenerator<EventKeysUnion<["messageCreate"]>, unknown>> {
    return composeFilter(
      super.filter(eventName),
      textCommandFilter({
        prefix: "deploy guild",
        permission: CommandPermission.AppOwner,
        yosugaUser: this.yosuga.client.user,
      })
    );
  }

  protected override async onEvent(
    eventName: EventKeysUnion<["messageCreate"]>,
    message: Message
  ): Promise<void> {
    this.logger.debug("deployGuild");

    //filterでチェック済み
    const guild = message.guild!;

    try {
      const commandList = loadCommands(this.yosuga.client, this.yosuga);
      const commandDataList = constructApplicationCommandsData(commandList);
      await registerApplicationCommands(this.yosuga.client, commandDataList, guild);

      const embed = constructEmbeds("plain", "正常に登録が完了しました.");
      await message.reply({
        embeds: embed,
      });
    } catch (e) {
      this.logger.error(e);
      const embed = constructEmbeds("warn", "登録中にエラーが発生しました.");
      await message.reply({
        embeds: embed,
      });
    }
  }
}
