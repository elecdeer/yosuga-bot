import { getLogger } from "../../logger";
import { rowComponent } from "../components/rowComponent";
import { createValueTable, valueTabledSelectComponent } from "../components/selectComponent";
import { useSelectInteraction } from "../hooks";
import { useReducer } from "../hooks/useReducer";

import type { LazySelectParam } from "../components/selectComponent";
import type { AnswerState, Prompt } from "../types/prompt";

type SelectPromptResult<TOption> = {
  value: TOption;
  selected: boolean;
}[];

const logger = getLogger("select");

export const selectPrompt = <TOption>(
  param: LazySelectParam<TOption, AnswerState<SelectPromptResult<TOption>>>
): Prompt<SelectPromptResult<TOption>> => {
  const { keyToOptionValue, optionValueToKey } = createValueTable("selectItem", param.options);

  return (customId, answer) => {
    const [state, dispatch] = useReducer<SelectPromptResult<TOption>, TOption[]>(
      selectReducer,
      param.options.map((option) => ({ value: option.value, selected: option.default ?? false }))
    );

    useSelectInteraction(customId, async (interaction) => {
      const selected = interaction.values.map((item) => keyToOptionValue(item));
      dispatch(selected);
      await interaction.deferUpdate();

      answer({ condition: "answered", value: state });
    });

    const status: AnswerState<SelectPromptResult<TOption>> =
      state.length >= (param.minValues ?? 1)
        ? { condition: "answered", value: state }
        : { condition: "unanswered" };

    //毎resolve時にテーブルを作るのは良くない気がする
    //TODO
    logger.trace("status", status);
    logger.trace("param", param);
    const { components, keyToOptionValue } = valueTabledSelectComponent(customId, param)(status);
    logger.trace("component", components);

    return rowComponent([components]);
  };
};

const selectReducer = <TOption>(state: SelectPromptResult<TOption>, action: TOption[]) => {
  return state.map((item) => ({
    value: item.value,
    selected: action.includes(item.value),
  }));
};
