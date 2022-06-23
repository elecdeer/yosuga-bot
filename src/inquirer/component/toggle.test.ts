import { describe, expect, it } from "vitest";

import { booleanToggleReducer, outputToggleState } from "./toggle";

describe("toggleコンポーネント", () => {
  describe("toggleReducer", () => {
    it("toggleAction - false", () => {
      const result = booleanToggleReducer(false, {
        type: "click",
        customId: "hoge",
      });
      expect(result).toBe(true);
    });

    it("toggleAction - true", () => {
      const result = booleanToggleReducer(true, {
        type: "click",
        customId: "huga",
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
});
