import { ButtonStyle, ComponentType } from "discord-api-types/v10";

import { getLogger } from "../../logger";

import type { Prompt } from "../types/prompt";

const logger = getLogger("button");

export const buttonPrompt = (): Prompt<number> => {
  return (ctx) => {
    const [count, setCount] = ctx.useState(0);
    ctx.useEffect(() => {
      logger.trace("useEffect");
      const timer = setInterval(() => {
        logger.trace(`setCount: ${count + 1}`);
        setCount(count + 1);
      }, 5000);
      return () => {
        clearInterval(timer);
      };
    }, []);

    return {
      status: {
        status: "unanswered",
      },
      component: {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            custom_id: "button",
            style: ButtonStyle.Primary,
            label: `${count}`,
          },
        ],
      },
    };
  };
};
