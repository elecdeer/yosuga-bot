import { ProcessorProvider } from "../types";

const spoilerRegex = /\|\|.*?\|\|/gm;

export const spoilerProcessor: ProcessorProvider<void> = () => async (speechText) => {
  return {
    ...speechText,
    text: speechText.text.replace(spoilerRegex, "ピー"),
  };
};
