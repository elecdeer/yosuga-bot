import { ComponentType } from "discord-api-types/v10";
import { describe, expect, test } from "vitest";

import { outputMonoSelectComponent } from "./monoSelectComponent";

describe("/inquirer/modules/monoSelectComponent", () => {
  describe("outputSelectComponent", () => {
    test("正しくコンポーネントペイロードが生成される", () => {
      const renderComponent = outputMonoSelectComponent("thisIsCustomId", {
        options: [
          {
            value: "valueA",
            label: "labelA",
          },
          {
            value: "valueB",
            label: "labelB",
          },
        ],
        placeholder: "thisIsPlaceholder",
        minValues: 1,
        maxValues: 1,
        disabled: false,
      });

      const state = {
        select: [
          {
            value: "valueA" as const,
            selected: true,
          },
          {
            value: "valueB" as const,
            selected: false,
          },
        ],
      };

      const result = renderComponent(state, {
        status: "answered",
        value: state.select,
      });

      expect(result).toEqual({
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.SelectMenu,
            custom_id: "thisIsCustomId",
            options: [
              {
                label: "labelA",
                value: "valueA",
                description: undefined,
                emoji: undefined,
                default: true,
              },
              {
                label: "labelB",
                value: "valueB",
                description: undefined,
                emoji: undefined,
                default: false,
              },
            ],
            placeholder: "thisIsPlaceholder",
            min_values: 1,
            max_values: 1,
            disabled: false,
          },
        ],
      });
    });
  });
});
