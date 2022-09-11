import { describe, expect, test } from "vitest";

import { outputSelectResult } from "./selectResult";

describe("/inquirer/modules/selectResult", () => {
  describe("outputSelectResult", () => {
    test("answeredになる場合", () => {
      const outputResult = outputSelectResult(1, () => 3);

      expect(
        outputResult({
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
        })
      ).toEqual({
        status: "answered",
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
      });
    });

    test("unansweredになる場合", () => {
      const outputResult = outputSelectResult(1, () => 2);

      expect(
        outputResult({
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
        })
      ).toEqual({
        status: "unanswered",
      });

      expect(
        outputResult({
          select: [
            {
              value: "valueA",
              selected: true,
            },
            {
              value: "valueB",
              selected: true,
            },
            {
              value: "valueC",
              selected: true,
            },
          ],
        })
      ).toEqual({
        status: "unanswered",
      });
    });
  });
});
