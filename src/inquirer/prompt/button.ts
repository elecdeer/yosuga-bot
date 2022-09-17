import { ButtonStyle, ComponentType } from "discord-api-types/v10";

import { getLogger } from "../../logger";
import { useState, useEffect } from "../hooks";

import type { Prompt } from "../types/prompt";

const logger = getLogger("button");

export const buttonPrompt = (): Prompt<number> => {
  return () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      logger.trace("useEffect");
      const timer = setInterval(() => {
        logger.trace(`setCount`);
        setCount((prev) => prev + 1);
      }, 5000);
      return () => {
        clearInterval(timer);
      };
    });

    return {
      status: count >= 2 ? { status: "answered", value: count } : { status: "unanswered" },
      component: {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            custom_id: "button",
            style: ButtonStyle.Primary,
            label: `count: ${count}`,
          },
        ],
      },
    };
  };
};
