import { describe, expect, it } from "vitest";

import { booleanToggleReducer, outputComponentParam, outputToggleState } from "./toggle";

describe("toggleコンポーネント", () => {
  describe("actionReducer", () => {
    it("toggleAction - false", () => {
      const result = booleanToggleReducer(false, {
        type: "toggle",
      });
      expect(result).toBe(true);
    });

    it("toggleAction - true", () => {
      const result = booleanToggleReducer(true, {
        type: "toggle",
      });
      expect(result).toBe(false);
    });
  });

  describe("outputState", () => {
    it("false", () => {
      const result = outputToggleState(false);
      expect(result).toEqual({
        status: "answered",
        value: false,
      });
    });

    it("true", () => {
      const result = outputToggleState(true);
      expect(result).toEqual({
        status: "answered",
        value: true,
      });
    });
  });

  describe("outputComponentParam", () => {
    it("true", () => {
      const result = outputComponentParam("thisIsCustomId", (value) => ({
        label: value ? "true" : "false",
      }))(true);
      expect(result).toEqual([
        [
          {
            type: "button",
            customId: "thisIsCustomId",
            label: "true",
          },
        ],
      ]);
    });
  });
});
