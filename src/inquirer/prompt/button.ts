import { getLogger } from "../../logger";
import { buttonComponent } from "../components/buttonComponent";
import { rowComponent } from "../components/rowComponent";
import { useState, useButtonInteraction, useEffect } from "../hooks";

import type { LazyParam } from "../../util/lazy";
import type { ButtonParam } from "../components/buttonComponent";
import type { Prompt } from "../types/prompt";

const logger = getLogger("button");

export const buttonPrompt = (style: LazyParam<ButtonParam, void>): Prompt<number> => {
  return (customId, answer) => {
    const [count, setCount] = useState(0);

    useButtonInteraction(customId, async (interaction) => {
      logger.trace("button pressed");
      setCount((prev) => prev + 1);
      await interaction.deferUpdate();
    });

    useEffect(() => {
      logger.trace("count changed", count);
      answer({ condition: "answered", value: count });
    });

    return rowComponent([buttonComponent(customId, style, undefined)]);
  };
};
