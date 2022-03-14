import { ClientEvents } from "discord.js";

import {
  constructApplicationCommandsData,
  registerApplicationCommands,
} from "../../application/commandRegister";
import { CommandPermission, fetchPermission } from "../../application/permissionUtil";
import { constructEmbeds } from "../../util/createEmbed";
import { removeMentionInMessageContent } from "../../util/removeMention";
import { YosugaClient } from "../../yosugaClient";
import { Handler } from "../base/handler";
import { isMessageMentionedCall } from "../filter/messageMentionFilter";
import { loadCommands } from "../handlerLoader";

export class DeployGuildHandler extends Handler<["messageCreate"]> {
  constructor(yosuga: YosugaClient) {
    super(["messageCreate"], yosuga);
  }

  protected override async filter(
    eventName: "messageCreate",
    args: ClientEvents["messageCreate"]
  ): Promise<boolean> {
    const [message] = args;

    this.logger.debug("deployGuildFilter");
    // if (!message.inGuild()) return false;
    if (!message.member) return false;
    if (!isMessageMentionedCall(this.yosuga.client.user)(message)) return false;
    this.logger.debug(removeMentionInMessageContent(message.content));
    if (!removeMentionInMessageContent(message.content).startsWith("deploy guild")) return false;
    if ((await fetchPermission(message.member)) < CommandPermission.AppOwner) return false;
    return super.filter(eventName, args);
  }

  protected async onEvent(
    eventName: "messageCreate",
    args: ClientEvents["messageCreate"]
  ): Promise<void> {
    const [message] = args;

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
      const embed = constructEmbeds("warn", "登録中にエラーが発生しました.");
      await message.reply({
        embeds: embed,
      });
    }
  }
}
