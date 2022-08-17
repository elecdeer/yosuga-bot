import { ButtonStyle, ComponentType } from "discord.js";

import { resolveLazy } from "../../util/lazy";
import { composePrompt } from "../composePrompt";

import type { LazyParam } from "../../util/lazy";
import type {
  ComponentPayload,
  OutputComponent,
  OutputResult,
  PromptFactory,
  StateReducer,
  SubscribeMessage,
} from "../inquirerTypes";
import type { APIMessageComponentEmoji } from "discord.js";

//APIButtonComponentBase
type ButtonParam = {
  style?: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger;
  disabled?: boolean;
  emoji?: APIMessageComponentEmoji;
  label?: string;
};

export const buttonPrompt = (param: {
  customId: string;
  button: LazyParam<ButtonParam, boolean>;
  initialAnswered?: boolean;
}): PromptFactory<void> => {
  const { customId = "button", button, initialAnswered = false } = param;
  return composePrompt({
    initialState: initialAnswered,
    subscribeMessages: [subscribeButtonInteraction(customId)],
    stateReducer: buttonReducer,
    outputResult: outputButtonResult,
    outputComponentParam: outputButtonComponent(customId, button),
  });
};

export type ButtonAction = {
  type: "click";
  customId: string;
};
export type ButtonState = boolean;

const subscribeButtonInteraction =
  (customId: string): SubscribeMessage<ButtonAction> =>
  (message, emitAction) => {
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (button) => button.customId === customId,
    });

    collector.on("collect", async (interaction) => {
      emitAction({ type: "click", customId });
      await interaction.deferUpdate();
    });

    return () => {
      collector.stop();
    };
  };

const buttonReducer: StateReducer<ButtonState, ButtonAction> = (prev, action) => {
  if (action.type === "click") {
    return true;
  }
  return prev;
};

const outputButtonResult: OutputResult<ButtonState, void> = (state) => {
  if (state) {
    return {
      status: "answered",
      value: undefined,
    };
  } else {
    return {
      status: "unanswered",
    };
  }
};

const outputButtonComponent = (
  customId: string,
  param: LazyParam<ButtonParam, boolean>
): OutputComponent<ButtonState, void> => {
  return (state, result) => {
    const { style, disabled, emoji, label } = resolveButtonParam(param, state);

    const payload: ComponentPayload = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          custom_id: customId,
          style: style ?? ButtonStyle.Primary,
          label: label,
          disabled: disabled,
          emoji: emoji,
        },
      ],
    };
    return payload;
  };
};

export const resolveButtonParam = <TResult>(
  param: LazyParam<ButtonParam, TResult>,
  value: TResult
): ButtonParam => {
  return {
    style: resolveLazy(param.style, value),
    disabled: resolveLazy(param.disabled, value),
    emoji: resolveLazy(param.emoji, value),
    label: resolveLazy(param.label, value),
  };
};
