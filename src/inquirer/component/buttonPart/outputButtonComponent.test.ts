import { describe, expect, it } from "vitest";

import { outputButtonComponent } from "./outputButtonComponent";

describe("outputButtonComponent", () => {
  it("正しくコンポーネントデータが出力されるか", () => {
    const customId = "thisIsCustomId";
    expect(
      outputButtonComponent<boolean>(customId, {
        label: (value) => (value ? "true" : "false"),
        style: "SUCCESS",
      })(false)
    ).toEqual([
      [
        {
          type: "BUTTON",
          customId: customId,
          label: "false",
          style: "SUCCESS",
        },
      ],
    ]);
  });
});
