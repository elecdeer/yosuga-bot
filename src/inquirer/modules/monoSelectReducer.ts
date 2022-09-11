import type { SelectState } from "../prompt/select";
import type { SelectAction } from "../types/action";

export const monoSelectReducer = <TOption extends string>(
  prev: SelectState<TOption>,
  action: SelectAction
) => {
  if (action.type === "select") {
    return {
      select: prev.select.map((option) => ({
        ...option,
        selected: action.selectedItems.includes(option.value),
      })),
    };
  }
  throw new Error("Invalid action type");
};
