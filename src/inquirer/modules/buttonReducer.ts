import type { StateReducer } from "../inquirerTypes";
import type { ButtonAction } from "../types/action";

export const buttonReducer: StateReducer<number, ButtonAction> = (prev, action) => {
  if (action.type === "click") {
    return prev + 1;
  }
  return prev;
};
