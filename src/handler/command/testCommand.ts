import { CommandPermission } from "../../application/permission";
import { CommandContextSlash } from "../../commandContextSlash";
import { ButtonComponent } from "../../inquirer/buttonComponent";
import { InteractionInquirer } from "../../inquirer/inquirer";
import { SelectComponent } from "../../inquirer/selectComponent";
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
        new ButtonComponent({
          id: "button2",
        }),
        new SelectComponent({
          id: "select",
        }),
      ],
      {
        time: 60 * 1000,
        message: "test",
      }
    );

    result.on("answered", ({ id, value }) => {
      this.logger.debug(`answer: ${id} ${value}`);
      this.logger.debug(`collection: ${JSON.stringify(result.answerStatus)}`);
    });

    // const answer = await result.awaitAll();

    const res = await result.awaitAnswer("select");
    this.logger.debug("select answered");
    const res2 = await result.awaitAnswer("button2");

    const resAll = await result.awaitAllAnswer().catch((reason) => {
      return "rejected";
    });

    this.logger.debug("allAnswered");
    this.logger.debug(JSON.stringify(resAll));
  }
}
