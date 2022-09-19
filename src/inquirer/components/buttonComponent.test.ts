import { ButtonStyle } from "discord-api-types/v10";
import { ComponentType } from "discord.js";
import { describe, expect, test } from "vitest";

import { buttonComponent } from "./buttonComponent";

import type { AnswerStatus } from "../types/prompt";

describe("/inquirer/components/buttonComponent", () => {
  describe("resolveButtonParam()", () => {
    test("正しく出力される", () => {
      expect(
        buttonComponent<AnswerStatus<number>>(
          "thisIsCustomId",
          {
            style: ButtonStyle.Secondary,
            disabled: false,
            label: (value) => ((value.value ?? 0) % 2 === 0 ? "odd" : "even"),
          },
          {
            condition: "answered",
            value: 1,
          }
        )
      ).toEqual({
        type: ComponentType.Button,
        custom_id: "thisIsCustomId",
        style: ButtonStyle.Secondary,
        label: "even",
        disabled: false,
      });
    });
  });
});
