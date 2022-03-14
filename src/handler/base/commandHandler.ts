import {
  ApplicationCommandData,
  ChatInputApplicationCommandData,
  ClientEvents,
  CommandInteraction,
  Interaction,
} from "discord.js";

import { CommandPermission, fetchPermission } from "../../application/permissionUtil";
import { CommandContext } from "../../commandContext";
import { CommandContextSlash, isValidCommandInteraction } from "../../commandContextSlash";
import { YosugaClient } from "../../yosugaClient";
import { Handler } from "./handler";

export type CommandProps = Pick<
  ChatInputApplicationCommandData,
  "name" | "description" | "options"
> & {
  permission: CommandPermission;
};

export abstract class CommandHandler extends Handler<["interactionCreate"]> {
  protected commandProps: CommandProps;

  public constructor(yosuga: YosugaClient) {
    super(["interactionCreate"], yosuga);
    this.commandProps = this.initCommandProps();
  }

  /**
   * アプリケーションコマンドとしてのデータを返す
   * 状態によって返す値を変えてはいけない
   * @protected
   */
  protected abstract initCommandProps(): CommandProps;

  /**
   * コマンドの実行時に呼ばれる
   * @param context
   */
  abstract execute(context: CommandContext): Promise<void>;

  protected override async filter(
    eventName: "interactionCreate",
    args: [Interaction]
  ): Promise<boolean> {
    const [interaction] = args;

    if (!interaction.isCommand()) return false;
    if (interaction.commandName !== this.commandProps.name) return false;
    return super.filter(eventName, args);
  }

  protected override async onEvent(
    eventName: "interactionCreate",
    args: ClientEvents["interactionCreate"]
  ): Promise<void> {
    //filterでチェック済み
    const [interaction] = args as [CommandInteraction];

    if (!isValidCommandInteraction(interaction)) return;
    const context = new CommandContextSlash(interaction, this.yosuga);

    if ((await fetchPermission(context.member)) < this.commandProps.permission) {
      await context.reply("prohibit", "このコマンドを実行する権限がありません.");
      return;
    }

    try {
      await this.execute(context);
    } catch (err) {
      await context.reply("warn", "エラーが発生しました.");
      this.logger.error(err);
    }
  }

  /**
   * アプリケーションコマンドとして登録する用のデータを返す
   * @protected
   */
  public constructInteractionData(): ApplicationCommandData {
    //TODO パーミッション
    return {
      ...this.commandProps,
      type: "CHAT_INPUT",
      // defaultPermission:
    };
  }
}

// import { CommandContext } from "../../commandContext";
// import { CommandPermission } from "../../permissionUtil";
// import { YosugaClient } from "../../yosugaClient";
// import { CommandHandler, CommandProps } from "../base/commandHandler";
//
// export class StartCommand extends CommandHandler {
//   constructor(yosuga: YosugaClient) {
//     super(yosuga);
//   }
//
//   protected initCommandProps(): CommandProps {
//     return {
//       name: "start",
//       description: "",
//       permission: CommandPermission.Everyone,
//     };
//   }
//
//   async execute(context: CommandContext): Promise<void> {
//
//   }
// }
