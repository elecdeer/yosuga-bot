import { getLogger } from "../logger";
import { immediateThrottle } from "../util/throttle";
import { onceTimer } from "../util/timer";
import { inquireCollector } from "./collector/inquireCollector";
import { createHookContext } from "./hookContext";
import { inquirerMessageProxy } from "./inquirerMessageProxy";

import type { Timer } from "../util/timer";
import type { InquirerOption, InquirerOptionController } from "./types/inquire";
import type { Prompt } from "./types/prompt";

const logger = getLogger("inquire");

export const inquire = <T extends Record<string, Prompt<unknown>>>(
  prompts: keyof T extends string ? T | [keyof T, T[keyof T]][] : never,
  option: InquirerOption
) => {
  const messageProxy = inquirerMessageProxy({
    messenger: option.messenger,
    messageContent: option.messageContent,
    ephemeral: option.ephemeral,
    rootTarget: option.rootTarget,
  });

  const promptEntries: [string, Prompt<unknown>][] = Array.isArray(prompts)
    ? prompts
    : Object.entries(prompts);

  const queueDispatch = immediateThrottle(() => {
    void edit();
  });
  const controller = createHookContext(queueDispatch);

  let resolveCount = 0;
  const resolvePrompts = () => {
    logger.debug("resolvePrompts", resolveCount);

    resetIdleTimer();

    controller.startRender();
    const renderResolved = promptEntries.map(([key, prompt]) => [key, prompt(key)] as const);
    controller.endRender();

    resolveCount++;

    return {
      components: renderResolved.map(([key, resolved]) => [key, resolved.component] as const),
      results: renderResolved.map(([key, resolved]) => [key, resolved.result] as const),
    };
  };

  const send = async () => {
    if (option.clearComponentsOnClose ?? false) {
      const latestMessage = option.messenger.postedMessages().at(-1);
      if (latestMessage !== undefined) {
        await messageProxy.edit([]);
      }
    }

    const { components, results } = resolvePrompts();
    const message = await messageProxy.send(components.map(([, component]) => component));
    controller.afterMount(message);

    updateStates(
      Object.fromEntries(results) as {
        [K in keyof T]: ReturnType<T[K]>["result"];
      }
    );

    return message;
  };

  const edit = async () => {
    const { components, results } = resolvePrompts();
    const message = await messageProxy.edit(components.map(([, component]) => component));
    if (message !== null) {
      controller.beforeUnmount();
      controller.afterMount(message);
    }

    updateStates(
      Object.fromEntries(results) as {
        [K in keyof T]: ReturnType<T[K]>["result"];
      }
    );

    return message;
  };

  const close = async () => {
    controller.close();

    if (option.clearComponentsOnClose ?? false) {
      const latestMessage = option.messenger.postedMessages().at(-1);
      if (latestMessage !== undefined) {
        await messageProxy.edit([]);
      }
    }

    closeCollector();
  };

  const inquireController = inquireCollector<{
    [K in keyof T]: ReturnType<T[K]>["result"];
  }>(Array.from(promptEntries.map(([key]) => key)));

  const { updateStates, close: closeCollector } = inquireController;

  const { resetIdleTimer } = createTimer(option, close);

  //初回
  setImmediate(() => {
    void send();
  });

  return {
    controller: {
      send,
      edit,
      close,
    },
    collector: inquireController,
  };
};

const createTimer = (
  option: Pick<InquirerOptionController, "idle" | "time">,
  close: () => Promise<void>
) => {
  if (option.time !== undefined) {
    const timeoutTimer = onceTimer(option.time);
    timeoutTimer.start(async () => {
      await close();
    });
  }

  let idleTimer: Timer | null = null;
  if (option.idle !== undefined) {
    idleTimer = onceTimer(option.idle);
    idleTimer.start(async () => {
      await close();
    });
  }

  const resetIdleTimer = () => {
    if (idleTimer !== null) {
      idleTimer.reset();
    }
  };

  return {
    resetIdleTimer,
  };
};
