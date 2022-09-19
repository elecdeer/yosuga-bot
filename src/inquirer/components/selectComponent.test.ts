import { ComponentType } from "discord-api-types/v10";
import { describe, expect, test } from "vitest";

import { createValueTable, selectComponent } from "./selectComponent";

describe("/inquirer/components/selectComponent", () => {
  describe("selectComponent()", () => {
    test("正しくコンポーネントが出力される", () => {
      expect(
        selectComponent(
          "thisIsCustomId",
          {
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
            maxValues: 3,
            minValues: 1,
            placeholder: "thisIsPlaceholder",
          },
          {
            condition: "answered",
            value: [
              {
                value: "valueA",
                selected: true,
              },
              {
                value: "valueB",
                selected: false,
              },
            ],
          }
        )
      ).toEqual({
        type: ComponentType.SelectMenu.valueOf(),
        custom_id: "thisIsCustomId",
        options: [
          {
            label: "labelA",
            value: "valueA",
            default: true,
          },
          {
            label: "labelB",
            value: "valueB",
            default: false,
          },
        ],
        max_values: 3,
        min_values: 1,
        placeholder: "thisIsPlaceholder",
        disabled: false,
      });
    });
  });

  describe("createValueTable()", () => {
    test("正しくテーブルが作成される", () => {
      const valueA = Symbol("valueA");
      const valueB = Symbol("valueB");

      const { optionValueToKey, keyToOptionValue } = createValueTable("thisIsCustomId", [
        {
          value: valueA,
        },
        {
          value: valueB,
        },
      ]);

      expect(keyToOptionValue(optionValueToKey(valueA))).toBe(valueA);
      expect(keyToOptionValue(optionValueToKey(valueB))).toBe(valueB);
    });
  });
});
