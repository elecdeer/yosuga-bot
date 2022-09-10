import { describe, expect, test } from "vitest";

import { monoButtonReducer } from "./monoButtonReducer";

import type { ButtonAction } from "../types/action";

describe("/inquirer/modules/buttonReducer", () => {
  describe("buttonReducer()", () => {
    test("clickActionの発火時にクリック回数が増える", () => {
      const action: ButtonAction = {
        type: "click",
        customId: "thisIsCustomId",
      };

      const prev = 0;
      expect(monoButtonReducer(prev, action)).toBe(1);
    });
  });
});
