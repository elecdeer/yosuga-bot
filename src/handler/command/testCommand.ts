import { CommandPermission } from "../../application/permission";
import { CommandContextSlash } from "../../commandContextSlash";
import { ButtonComponent } from "../../inquirer/buttonComponent";
import { InteractionInquirer } from "../../inquirer/inquirer";
import { CommandHandler, CommandProps } from "../base/commandHandler";

export class TestCommand extends CommandHandler {
  protected initCommandProps(): CommandProps {
    return {
      name: "test",
      description: "テスト",
      permission: CommandPermission.Everyone,
    };
  }

  override async execute(context: CommandContextSlash): Promise<void> {
    const inquirer = new InteractionInquirer({
      replyRoot: context.interaction,
      message: "テスト",
    });

    const result = await inquirer.prompt(
      [
        new ButtonComponent({
          id: "button",
        }),
      ],
      {
        time: 60 * 1000,
        message: "test",
      }
    );
    result.collect((id, value) => {
      this.logger.debug(`answer: ${id} ${value}`);
    });
    const answer = await result.awaitAll();

    this.logger.debug(JSON.stringify(answer));
  }
}
