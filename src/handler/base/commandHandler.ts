import { ChatInputApplicationCommandData, CommandInteraction, Interaction } from "discord.js";

import { CommandPermission, hasMemberPermission } from "../../application/permission";
import { CommandContextSlash, isValidCommandInteraction } from "../../commandContextSlash";
import { YosugaClient } from "../../yosugaClient";
import { commandFilter } from "../filter/commandFilter";
import { composeFilter, EventFilter } from "../filter/eventFilter";
import { tapLogFilter } from "../filter/logFilter";
import { EventKeysUnion, Handler } from "./handler";

export type CommandProps = Omit<ChatInputApplicationCommandData, "type"> & {
  permission: CommandPermission;
};

export abstract class CommandHandler<TProp extends CommandProps = CommandProps> extends Handler<
  ["interactionCreate"]
> {
  public constructor(yosuga: YosugaClient) {
    super(["interactionCreate"], yosuga);
  }

  /**
   * アプリケーションコマンドとしてのデータを返す
   * 状態によって返す値を変えてはいけない
   * @protected
   */
  protected abstract initCommandProps(): TProp;

  public get commandProps(): TProp {
    return this.initCommandProps();
  }

  /**
   * コマンドの実行時に呼ばれる
   * @param context
   */
  abstract execute(context: CommandContextSlash): Promise<void>;

  protected override filter(
    eventName: EventKeysUnion<["interactionCreate"]>
  ): EventFilter<EventKeysUnion<["interactionCreate"]>> {
    return composeFilter(
      super.filter(eventName),
      commandFilter(this),
      tapLogFilter({
        logger: this.logger,
        textGen: (interaction) => {
          return `commandCalled ${interaction.id} ${interaction.user.toString()}`;
        },
      })
    );
  }

  protected override async onEvent(
    eventName: EventKeysUnion<["interactionCreate"]>,
    interaction: Interaction
  ): Promise<void> {
    //filterでチェック済み
    const commandInteraction = interaction as CommandInteraction;
    await commandInteraction.guild?.fetch();
    if (!isValidCommandInteraction(commandInteraction)) return;
    const context = new CommandContextSlash(commandInteraction, this.yosuga);

    if (!(await hasMemberPermission(context.member, this.commandProps.permission))) {
      await context.reply({
        type: "prohibit",
        content: "このコマンドを実行する権限がありません.",
      });
      return;
    }

    try {
      await this.execute(context);
    } catch (err) {
      await context.reply({
        type: "warn",
        content: "エラーが発生しました.",
      });
      this.logger.error(err);
    }
  }

  /**
   * アプリケーションコマンドとして登録する用のデータを返す
   * @protected
   */
  public constructInteractionData(): ChatInputApplicationCommandData {
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
