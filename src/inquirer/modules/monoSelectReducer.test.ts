import { describe, expect, test } from "vitest";

import { monoSelectReducer } from "./monoSelectReducer";

import type { SelectState } from "../prompt/select";

describe("/inquirer/modules/monoSelectReducer", () => {
  describe("monoSelectReducer()", () => {
    test("新たに選択する", () => {
      const prev: SelectState = {
        select: [
          {
            value: "valueA",
            selected: false,
          },
          {
            value: "valueB",
            selected: false,
          },
        ],
      };
      expect(
        monoSelectReducer(prev, {
          type: "select",
          customId: "thisIsCustomId",
          selectedItems: ["valueA"],
        })
      ).toEqual({
        select: [
          {
            value: "valueA",
            selected: true,
          },
          {
            value: "valueB",
            selected: false,
          },
        ],
      });
    });

    test("選択を外す", () => {
      const prev: SelectState = {
        select: [
          {
            value: "valueA",
            selected: true,
          },
          {
            value: "valueB",
            selected: true,
          },
        ],
      };
      expect(
        monoSelectReducer(prev, {
          type: "select",
          customId: "thisIsCustomId",
          selectedItems: ["valueB"],
        })
      ).toEqual({
        select: [
          {
            value: "valueA",
            selected: false,
          },
          {
            value: "valueB",
            selected: true,
          },
        ],
      });
    });

    test("選択状態に変化なし", () => {
      const prev: SelectState = {
        select: [
          {
            value: "valueA",
            selected: true,
          },
          {
            value: "valueB",
            selected: false,
          },
        ],
      };
      expect(
        monoSelectReducer(prev, {
          type: "select",
          customId: "thisIsCustomId",
          selectedItems: ["valueA"],
        })
      ).toEqual({
        select: [
          {
            value: "valueA",
            selected: true,
          },
          {
            value: "valueB",
            selected: false,
          },
        ],
      });
    });
  });
});
