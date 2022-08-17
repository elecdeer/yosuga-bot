import { Collection } from "discord.js";

import { onceTimer } from "../util/timer";
import { createInquireCollector } from "./inquirerCollector";
import { createInquireController } from "./inquirerController";

import type { Timer } from "../util/timer";
import type {
  Prompt,
  PromptCollector,
  PromptController,
  PromptFactory,
  PromptOption,
  PromptOptionTimer,
  PromptOptionMessage,
} from "./inquirerTypes";

export const inquire = async <T extends Record<string, PromptFactory<unknown>>>(
  prompts: T | [keyof T, T[keyof T]][],
  option: PromptOption
): Promise<{
  controller: PromptController;
  collector: PromptCollector<{
    [K in keyof T]: ReturnType<T[K]>;
  }>;
}> => {
  const { scene, rootTarget, idle, time, messageContent, ephemeral } = option;
  const timerParam: PromptOptionTimer = {
    time,
    idle,
  };
  const messageParam: PromptOptionMessage = {
    scene,
    rootTarget,
    messageContent,
    ephemeral,
  };

  const factoryCollection = new Collection<keyof T, T[keyof T]>(
    Array.isArray(prompts) ? prompts : (Object.entries(prompts) as [keyof T, T[keyof T]][])
  );

  const promptCollection: Collection<keyof T, Prompt<unknown>> = factoryCollection.mapValues(
    (factory, key) =>
      factory(
        () => {
          updateStatus(key);
          resetIdleTimer();
        },
        () => {
          setImmediate(() => {
            void controller.edit();
          });
          resetIdleTimer();
        }
      )
  );

  const controller = await createInquireController(
    promptCollection as Collection<string, Prompt<unknown>>,
    messageParam
  );

  const { collector, updateStatus, close } = createInquireCollector<{
    [K in keyof T]: ReturnType<T[K]>;
  }>(promptCollection as Collection<keyof T, ReturnType<T[keyof T]>>);

  if (timerParam.time !== undefined) {
    const timeoutTimer = onceTimer(timerParam.time);
    timeoutTimer.start(async () => {
      close();
      await controller.close();
    });
  }

  let idleTimer: Timer | null = null;
  if (timerParam.idle !== undefined) {
    idleTimer = onceTimer(timerParam.idle);
    idleTimer.start(async () => {
      close();
      await controller.close();
    });
  }

  const resetIdleTimer = () => {
    if (idleTimer === null) return;
    idleTimer.reset();
  };

  return {
    controller,
    collector,
  };
};
