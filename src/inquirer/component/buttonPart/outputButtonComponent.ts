import type { OutputComponentParam } from "../../promptTypes";
import type { ButtonParam } from "../../wrapper/createButton";

export const outputButtonComponent =
  <TState>(
    customId: string,
    param: (value: TState) => Omit<ButtonParam, "customId" | "type">
  ): OutputComponentParam<TState> =>
  (value) => {
    return [
      [
        {
          ...param(value),
          type: "BUTTON",
          customId: customId,
        },
      ],
    ];
  };
