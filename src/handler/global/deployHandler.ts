import { ClientEvents } from "discord.js";

import { YosugaClient } from "../../yosugaClient";
import { Handler } from "../base/handler";

export class DeployHandler extends Handler<["messageCreate"]> {
  constructor(yosuga: YosugaClient) {
    super(["messageCreate"], yosuga);
  }

  protected override async filter(
    eventName: "messageCreate",
    args: ClientEvents["messageCreate"]
  ): Promise<boolean> {
    const [message] = args;

    if (!message.mentions.users.some((user) => user.id === this.yosuga.client.user.id))
      return false;

    return super.filter(eventName, args);
  }

  protected async onEvent(
    eventName: "messageCreate",
    args: ClientEvents["messageCreate"]
  ): Promise<void> {
    const [message] = args;

    //TODO これはデモ
    this.logger.debug(message.content);
    await message.react("👍");
  }
}
