import {
  ChatInputApplicationCommandData,
  ClientEvents,
  CommandInteraction,
  Interaction,
} from "discord.js";

import { CommandPermission, hasMemberPermission } from "../../application/permission";
import { CommandContext } from "../../commandContext";
import { CommandContextSlash, isValidCommandInteraction } from "../../commandContextSlash";
import { YosugaClient } from "../../yosugaClient";
import { isCommandCall } from "../filter/commandFilter";
import { Handler } from "./handler";

export type CommandProps = Omit<ChatInputApplicationCommandData, "type"> & {
  permission: CommandPermission;
};

export abstract class CommandHandler<TProp extends CommandProps = CommandProps> extends Handler<
  ["interactionCreate"]
> {
  public commandProps: Readonly<TProp>;

  public constructor(yosuga: YosugaClient) {
    super(["interactionCreate"], yosuga);
    this.commandProps = this.initCommandProps();
  }

  /**
   * アプリケーションコマンドとしてのデータを返す
   * 状態によって返す値を変えてはいけない
   * @protected
   */
  protected abstract initCommandProps(): TProp;

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

    if (!isCommandCall(this)(interaction)) return false;
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

    if (!(await hasMemberPermission(context.member, this.commandProps.permission))) {
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
  protected constructInteractionData(): ChatInputApplicationCommandData {
    return {
      ...this.commandProps,
      type: "CHAT_INPUT",
      defaultPermission: true,
    };
  }
}

//
// import { CommandPermission } from "../../application/permission";
// import { CommandContext } from "../../commandContext";
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
