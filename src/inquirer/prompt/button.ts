import { getLogger } from "../../logger";
import { buttonComponent } from "../components/buttonComponent";
import { rowComponent } from "../components/rowComponent";
import { useState, useButtonInteraction } from "../hooks";

import type { LazyParam } from "../../util/lazy";
import type { ButtonParam } from "../components/buttonComponent";
import type { AnswerState, Prompt } from "../types/prompt";

const logger = getLogger("button");

export const buttonPrompt = (
  style: LazyParam<ButtonParam, AnswerState<number>>
): Prompt<number> => {
  return (customId) => {
    const [count, setCount] = useState(0);

    useButtonInteraction(customId, async (interaction) => {
      logger.trace("button pressed");
      setCount((prev) => prev + 1);
      await interaction.deferUpdate();
    });

    const state: AnswerState<number> =
      count > 0 ? { condition: "answered", value: count } : { condition: "unanswered" };

    return {
      result: state,
      component: rowComponent([buttonComponent(customId, style, state)]),
    };
  };
};
