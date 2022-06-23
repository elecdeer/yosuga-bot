import { Collection } from "discord.js";

import { createInquireCollector } from "./inquireCollector";
import { createInquireController } from "./inquireController";

import type {
  Prompt,
  PromptCollector,
  PromptController,
  PromptFactory,
  PromptParam,
  PromptParamHook,
  PromptParamMessage,
} from "./promptTypes";

export const inquire = async <T extends Record<string, PromptFactory<unknown>>>(
  components: T | [keyof T, T[keyof T]][],
  promptParam: PromptParam
): Promise<{
  controller: PromptController;
  collector: PromptCollector<{
    [K in keyof T]: ReturnType<T[K]>;
  }>;
}> => {
  const { scene, rootTarget, idle, time, messageContent, ephemeral } = promptParam;
  const hookParam: PromptParamHook = {
    time,
    idle,
  };
  const messageParam: PromptParamMessage = {
    scene,
    rootTarget,
    messageContent,
    ephemeral,
  };

  const factoryCollection = new Collection<keyof T, T[keyof T]>(
    Array.isArray(components) ? components : (Object.entries(components) as [keyof T, T[keyof T]][])
  );

  const updateComponent = () => {
    setImmediate(() => {
      void controller.edit();
    });
  };

  const promptCollection: Collection<keyof T, Prompt<unknown>> = factoryCollection.mapValues(
    (factory, key) => factory(hookParam, () => updateStatus(key), updateComponent)
  );

  const controller = await createInquireController(
    promptCollection as Collection<string, Prompt<unknown>>,
    messageParam
  );

  const { collector, updateStatus } = createInquireCollector<{
    [K in keyof T]: ReturnType<T[K]>;
  }>(promptCollection as Collection<keyof T, ReturnType<T[keyof T]>>);

  return {
    controller,
    collector,
  };
};
