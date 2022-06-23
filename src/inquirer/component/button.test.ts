import { describe, expect, it } from "vitest";

import { buttonReducer, outputButtonState } from "./button";
import { outputButtonComponent } from "./buttonPart/outputButtonComponent";

describe("buttonコンポーネント", () => {
  describe("stateReducer", () => {
    it("未クリック状態でクリック", () => {
      expect(buttonReducer(false, { type: "click" })).toBe(true);
    });

    it("既クリック状態でクリック", () => {
      expect(buttonReducer(true, { type: "click" })).toBe(true);
    });
  });

  describe("outputState", () => {
    it("未クリック状態", () => {
      expect(outputButtonState(false)).toEqual({
        status: "unanswered",
      });
    });

    it("既クリック状態", () => {
      expect(outputButtonState(true)).toEqual({
        status: "answered",
      });
    });
  });

  describe("outputComponentParam", () => {
    it("未クリック状態", () => {
      const customId = "thisIsCustomId";
      expect(
        outputButtonComponent<boolean>(customId, (value) => ({
          label: value ? "true" : "false",
        }))(false)
      ).toEqual([
        [
          {
            type: "BUTTON",
            customId: customId,
            label: "false",
          },
        ],
      ]);
    });
  });
});
