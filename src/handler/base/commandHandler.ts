import {
  ApplicationCommandData,
  ChatInputApplicationCommandData,
  ClientEvents,
  CommandInteraction,
  Interaction,
} from "discord.js";

import { CommandContext } from "../../commandContext";
import { CommandContextSlash, isValidCommandInteraction } from "../../commandContextSlash";
import { YosugaClient } from "../../yosugaClient";
import { Handler } from "./handler";

export type CommandProps = Pick<
  ChatInputApplicationCommandData,
  "name" | "description" | "options"
>;

export abstract class CommandHandler extends Handler<["interactionCreate"]> {
  protected constructor(yosuga: YosugaClient) {
    super(["interactionCreate"], yosuga);
  }

  /**
   * アプリケーションコマンドとしてのデータを返す
   * 状態によって返す値を変えてはいけない
   * @protected
   */
  protected abstract commandProps(): CommandProps;

  /**
   * コマンドの実行時に呼ばれる
   * @param context
   */
  abstract execute(context: CommandContext): Promise<void>;

  protected override async filter(
    eventName: "interactionCreate",
    ...args: [Interaction]
  ): Promise<boolean> {
    const [interaction] = args;

    if (!interaction.isCommand()) return false;
    if (interaction.commandName !== this.commandProps().name) return false;
    return super.filter(eventName, ...args);
  }

  protected override async onEvent(
    eventName: "interactionCreate",
    args: ClientEvents["interactionCreate"]
  ): Promise<void> {
    //filterでチェック済み
    const [interaction] = args as [CommandInteraction];

    if (!isValidCommandInteraction(interaction)) return;
    const context = new CommandContextSlash(interaction, this.yosuga);
    await this.execute(context);
  }

  /**
   * アプリケーションコマンドとして登録する用のデータを返す
   * @protected
   */
  protected constructInteractionData(): ApplicationCommandData {
    const baseProps = this.commandProps();

    //TODO パーミッション
    return {
      ...baseProps,
      type: "CHAT_INPUT",
    };
  }
}
