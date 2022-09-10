import { ButtonStyle, ComponentType } from "discord.js";
import { describe, expect, test } from "vitest";

import { outputButtonComponent } from "./buttonComponent";

describe("/inquirer/modules/buttonComponent", () => {
  describe("outputButtonComponent()", () => {
    test("正しくコンポーネントペイロードが生成される", () => {
      const renderComponent = outputButtonComponent<number>("thisIsCustomId", {
        label: (value) => (value % 2 === 0 ? "odd" : "even"),
        style: ButtonStyle.Secondary,
      });

      expect(
        renderComponent(0, {
          status: "answered",
          value: undefined,
        })
      ).toEqual({
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            custom_id: "thisIsCustomId",
            style: ButtonStyle.Secondary,
            label: "odd",
            disabled: false,
            emoji: undefined,
          },
        ],
      });
    });
  });
});
