import { CommandPermission } from "../../application/permission";
import { createButtonComponent } from "../../inquirer/component/button";
import { createModalTextComponent } from "../../inquirer/component/modalText";
import { createPagedSelectComponent } from "../../inquirer/component/pagedSelect";
import { createToggleComponent } from "../../inquirer/component/toggle";
import { prompt } from "../../inquirer/prompt";
import { createYosugaEmbed } from "../../util/createEmbed";
import { range } from "../../util/range";
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
    const { controller, collector } = await prompt(
      {
        button: createButtonComponent({
          button: {
            label: "Test",
          },
        }),
        select: createPagedSelectComponent({
          selector: {
            minValues: 0,
            maxValues: 3,
          },
          options: {
            type: "balance",
            numPerPageMax: 10,
            options: range(0, 18).map((num) => ({
              label: num.toString(),
              value: num,
            })),
          },
          pageTorus: false,
        }),
        toggle: createToggleComponent<"happy" | "crying" | "thinking">({
          button: {
            emoji: () => {
              const map = {
                happy: "😀",
                crying: "😢",
                thinking: "🤔",
              } as const;
              const state: keyof typeof map = collector.getStatus().toggle.value ?? "happy";

              return map[state];
            },
          },
          toggleOptions: ["happy", "crying", "thinking"],
        }),
        text: createModalTextComponent({
          openButton: {
            label: "Text",
          },
          textInputs: {
            short: {
              label: "Short Text",
              style: "SHORT",
              validation: (input) =>
                input.startsWith("!")
                  ? {
                      result: "ok",
                    }
                  : {
                      result: "reject",
                      reason: "Short Textの値が!から始まっていません",
                    },
            },
            paragraph: {
              label: "Paragraph Text",
              style: "PARAGRAPH",
            },
          },
          modal: {
            title: "Modal!!",
          },
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
        ephemeral: true,
      }
    );

    collector.onUpdateOne("button", async (status) => {
      this.logger.log(`toggled: ${JSON.stringify(status)}`);
      await controller.edit();
    });

    collector.onUpdateOne("toggle", async (status) => {
      this.logger.log(`toggled: ${JSON.stringify(status)}`);
      await controller.edit();
    });

    collector.onUpdateOne("select", async (status) => {
      this.logger.log(`selected: ${JSON.stringify(status)}`);
      await controller.edit();
    });

    collector.onUpdateOne("text", async (status) => {
      this.logger.log(`text: ${JSON.stringify(status)}`);
      await controller.edit();
    });

    const result = await collector.awaitAll();
    this.logger.log(`allSelected: ${JSON.stringify(result)}`);
  }
}
