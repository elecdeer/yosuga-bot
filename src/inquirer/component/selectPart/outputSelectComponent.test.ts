import { describe, expect, it } from "vitest";

import { outputSelectComponent } from "./outputSelectComponent";

describe("inquirer/component/selectPart/outputSelectComponent", () => {
  it("正しくコンポーネントデータが出力されるか", () => {
    const customId = "thisIsCustomId";

    expect(
      outputSelectComponent(customId, {
        options: [
          {
            label: "label0",
            value: "value0",
          },
          {
            label: "label1",
            value: "value1",
          },
          {
            label: () => "label2",
            value: "value2",
          },
        ],
        placeholder: () => "placeholder",
        disabled: false,
        maxValues: 1,
        minValues: 0,
      })(["value0"])
    ).toEqual([
      [
        {
          type: "SELECT_MENU",
          customId: customId,
          options: [
            {
              label: "label0",
              value: "value0",
              default: true,
            },
            {
              label: "label1",
              value: "value1",
              default: false,
            },
            {
              label: "label2",
              value: "value2",
              default: false,
            },
          ],
          placeholder: "placeholder",
          disabled: false,
          maxValues: 1,
          minValues: 0,
        },
      ],
    ]);
  });
});
