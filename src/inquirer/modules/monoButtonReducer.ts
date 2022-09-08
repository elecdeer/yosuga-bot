import type { ButtonAction } from "../types/action";
import type { StateReducer } from "../types/prompt";

export const monoButtonReducer: StateReducer<number, ButtonAction> = (prev, action) => {
  if (action.type === "click") {
    return prev + 1;
  }
  throw new Error("Invalid action type");
};
