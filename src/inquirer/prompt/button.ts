import { getLogger } from "../../logger";
import { buttonComponent } from "../components/buttonComponent";
import { rowComponent } from "../components/rowComponent";
import { useState, useButtonInteraction } from "../hooks";

import type { LazyParam } from "../../util/lazy";
import type { ButtonParam } from "../components/buttonComponent";
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
