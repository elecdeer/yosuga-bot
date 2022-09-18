import { getLogger } from "../../logger";
import { useState, useButtonInteraction } from "../hooks";
import { buttonComponent } from "../modules/buttonComponent";
import { rowComponent } from "../modules/rowComponent";

import type { LazyParam } from "../../util/lazy";
import type { ButtonParam } from "../modules/buttonComponent";
import type { AnswerStatus, Prompt } from "../types/prompt";

const logger = getLogger("button");

export const buttonPrompt = (
  style: LazyParam<ButtonParam, AnswerStatus<number>>
): Prompt<number> => {
  return (customId) => {
    const [count, setCount] = useState(0);

    useButtonInteraction(customId, async (interaction) => {
      logger.trace("button pressed");
      setCount((prev) => prev + 1);
      await interaction.deferUpdate();
    });

    const status: AnswerStatus<number> =
      count > 0 ? { condition: "answered", value: count } : { condition: "unanswered" };

    return {
      status: status,
      component: rowComponent([buttonComponent(customId, style, status)]),
    };
  };
};
