import type { OutputResult } from "../inquirerTypes";

export const outputButtonResult: OutputResult<number, void> = (state) => {
  if (state > 0) {
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
