import { CommandPermission } from "../../application/permission";
import { CommandContextSlash } from "../../commandContextSlash";
import { createButtonComponent } from "../../inquirer/component/button";
import { createSelectComponent } from "../../inquirer/component/select";
import { prompt } from "../../inquirer/prompt";
import { createYosugaEmbed } from "../../util/createEmbed";
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
    const { controller, collector } = await prompt(
      {
        toggle: createButtonComponent({}),
        select: createSelectComponent({}),
      },
      {
        type: "commandInteraction",
        destination: context.interaction,
      },
      {
        messageContent: createYosugaEmbed({
          message: "toggle test",
        }),
      }
    );

    collector.onUpdateOne("toggle", async (status) => {
      this.logger.log(`toggled: ${JSON.stringify(status)}`);
      await controller.edit();
    });

    collector.onUpdateOne("select", async (status) => {
      this.logger.log(`selected: ${JSON.stringify(status)}`);
      // await controller.edit();
    });

    const result = await collector.awaitAll();
    this.logger.log(`allSelected: ${JSON.stringify(result)}`);

    // const inquirer = new InteractionInquirer({
    //   replyRoot: context.interaction,
    //   message: "テスト",
    // });
    //
    // const options: SelectOption<"hello" | number>[] = [
    //   {
    //     label: "str",
    //     value: "hello" as const,
    //   },
    //   {
    //     label: "num",
    //     value: 100,
    //   },
    // ];
    //
    // const result = await inquirer.prompt(
    //   [
    //     new ButtonComponent({
    //       id: "button",
    //     }),
    //     new ButtonComponent({
    //       id: "button2",
    //     }),
    //     new MultiSelectComponent({
    //       id: "select",
    //       options: options,
    //     }),
    //   ],
    //   {
    //     time: 60 * 1000,
    //     message: "test",
    //   }
    // );
    //
    // result.on("answered", ({ id, value }) => {
    //   this.logger.debug(`answer: ${id} ${value}`);
    //   this.logger.debug(`collection: ${JSON.stringify(result.answerStatus)}`);
    // });
    //
    // // const answer = await result.awaitAll();
    //
    // const res = await result.awaitAnswer("select");
    // this.logger.debug("select answered");
    // const res2 = await result.awaitAnswer("button2");
    //
    // const resAll = await result.awaitAllAnswer();
    //
    // this.logger.debug("allAnswered");
    // this.logger.debug(JSON.stringify(resAll));
  }
}
