import { ProcessorProvider } from "../types";

export const maxLengthProcessor: ProcessorProvider<number> = (max: number) => async (
  speechText
) => {
  const charArray = Array.from(speechText.text);

  //サロゲートペアを考慮した長さ
  const length = charArray.length;

  if (length <= max) {
    return speechText;
  }

  return {
    ...speechText,
    text: charArray.slice(0, max).join("") + " 以下略",
  };
};
