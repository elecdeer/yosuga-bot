import type { ButtonAction } from "../types/action";
import type { StateReducer } from "../types/prompt";

export const buttonReducer: StateReducer<number, ButtonAction> = (prev, action) => {
  if (action.type === "click") {
    return prev + 1;
  }
  return prev;
};
