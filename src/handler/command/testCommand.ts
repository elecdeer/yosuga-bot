import { CommandPermission } from "../../application/permission";
import { CommandContextSlash } from "../../commandContextSlash";
import { createButtonComponent } from "../../inquirer/component/button";
import { createMultiSelectComponent } from "../../inquirer/component/multiSelect";
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
        toggle: createButtonComponent({
          button: {
            label: "Test",
          },
        }),
        select: createMultiSelectComponent({
          selector: {},
          options: [
            {
              label: "AAAStr",
              value: "AAA",
              default: true,
            },
            {
              label: "BBBStr",
              value: "BBB",
            },
            {
              label: "CCCStr",
              value: "CCC",
            },
          ],
        }),
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
      await controller.edit();
    });

    const result = await collector.awaitAll();
    this.logger.log(`allSelected: ${JSON.stringify(result)}`);
  }
}
