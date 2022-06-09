import { resolveLazy } from "../../util/lazy";
import { componentHook } from "./componentHook";

import type { Lazy } from "../../util/lazy";
import type { PromptComponent } from "../promptTypes";
import type { Awaitable, MappedInteractionTypes, MessageComponentType } from "discord.js";

export const componentHookWithValue =
  <TComponent extends MessageComponentType>(componentType: TComponent) =>
  <TValue>(param: {
    customId: string;
    reducer: (
      interaction: MappedInteractionTypes[TComponent],
      prevStatus: TValue | null
    ) => Awaitable<TValue | null>;
    initialState?: Lazy<TValue | null>;
  }): Pick<PromptComponent<TValue>, "hook" | "getStatus"> & {
    getRawValue: () => TValue | null;
  } => {
    const { customId, reducer, initialState } = param;
    let status: TValue | null = initialState === undefined ? null : resolveLazy(initialState);

    const hook = componentHook(componentType)({
      customId: customId,
      onInteraction: async (interaction) => {
        status = await reducer(interaction, status);
        return true;
      },
      onEnd: () => true,
    });

    return {
      hook: hook,
      getRawValue: () => status,
      getStatus: () => {
        if (status !== null) {
          return {
            status: "answered",
            value: status,
          };
        } else {
          return {
            status: "unanswered",
          };
        }
      },
    };
  };

export const buttonComponentHookValue = componentHookWithValue("BUTTON");
export const selectMenuComponentHookValue = componentHookWithValue("SELECT_MENU");
export const textInputComponentHookValue = componentHookWithValue("TEXT_INPUT");
