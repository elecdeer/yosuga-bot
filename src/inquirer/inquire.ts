import { Collection } from "discord.js";

import { getLogger } from "../logger";
import { immediateThrottle } from "../util/throttle";
import { createHookContext } from "./hookContext";
import { inquireCollector } from "./inquireCollector";
import { inquirerMessageProxy } from "./inquirerMessageProxy";

import type { InquirerOption } from "./types/inquire";
import type { AnswerStatus, Prompt } from "./types/prompt";

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

  const promptCollection = new Collection<keyof T, T[keyof T]>(
    Array.isArray(prompts) ? prompts : (Object.entries(prompts) as [keyof T, T[keyof T]][])
  );

  const queueDispatch = immediateThrottle(() => {
    void edit();
  });
  const controller = createHookContext(queueDispatch);

  let resolveCount = 0;
  const resolvePrompts = () => {
    logger.debug("resolvePrompts", resolveCount);
    controller.startRender();
    const renderResults = promptCollection.mapValues((prompt, key) => prompt(key as string));
    controller.endRender();

    resolveCount++;

    return {
      component: renderResults.mapValues((result) => result.component),
      status: renderResults.mapValues((result) => result.status),
    };
  };

  const send = async () => {
    if (option.clearComponentsOnClose ?? false) {
      const latestMessage = option.messenger.postedMessages().at(-1);
      if (latestMessage !== undefined) {
        await messageProxy.edit([]);
      }
    }

    const { component, status } = resolvePrompts();
    const message = await messageProxy.send(Array.from(component.values()));
    controller.afterMount(message);

    await updateStatus(status);

    return message;
  };

  const edit = async () => {
    const { component, status } = resolvePrompts();
    const message = await messageProxy.edit(Array.from(component.values()));
    if (message !== null) {
      controller.beforeUnmount();
      controller.afterMount(message);
    }
    await updateStatus(status);

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
  };

  //初回
  setImmediate(() => {
    void send();
  });

  const inquireController = inquireCollector<{
    [K in keyof T]: ReturnType<T[K]>["status"];
  }>(Array.from(promptCollection.keys()));

  let prevStatus = new Collection<keyof T, AnswerStatus<unknown>>(
    promptCollection.map((_, key) => [key, { condition: "unanswered" }])
  );
  const updateStatus = async (statusList: Collection<keyof T, AnswerStatus<unknown>>) => {
    logger.trace("updateStatus", statusList);
    inquireController.root.emit({
      prev: prevStatus,
      next: statusList,
    });
    prevStatus = statusList;
  };

  return {
    controller: {
      send,
      edit,
      close,
    },
    collector: inquireController,
  };
};
