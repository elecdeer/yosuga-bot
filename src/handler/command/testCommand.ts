import { CommandPermission } from "../../application/permission";
import { createSelect } from "../../inquirer/component/select";
import { createToggle } from "../../inquirer/component/toggle";
import { inquire } from "../../inquirer/inquire";
import { createYosugaEmbed } from "../../util/createEmbed";
import { CommandHandler } from "../base/commandHandler";

import type { CommandContextSlash } from "../../commandContextSlash";
import type { CommandProps } from "../base/commandHandler";

export class TestCommand extends CommandHandler {
  protected initCommandProps(): CommandProps {
    return {
      name: "test",
      description: "テスト",
      permission: CommandPermission.Everyone,
    };
  }

  override async execute(context: CommandContextSlash): Promise<void> {
    const { controller, collector } = await inquire(
      {
        toggle: createToggle({
          button: {
            label: () => (collector.getStatus().toggle.value === true ? "ON" : "OFF"),
          },
        }),
        select: createSelect({
          select: {
            options: [
              {
                label: "label0",
                value: 0,
              },
              {
                label: "label1",
                value: 1,
                default: true,
              },
              {
                label: (value) => `${value.length} selected`,
                value: 2,
              },
            ],
            placeholder: "please select",
            maxValues: 2,
            minValues: 2,
          },
        }),
      },
      {
        messageContent: createYosugaEmbed({
          message: "toggle test",
        }),
        ephemeral: true,
        scene: {
          type: "textChannel",
          channel: context.textChannel,
        },
        rootTarget: {
          type: "commandInteraction",
          interaction: context.interaction,
        },
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
