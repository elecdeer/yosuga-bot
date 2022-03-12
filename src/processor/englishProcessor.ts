import { replaceEnglishRead } from "./englishRead/englishRead";
import { ProcessorProvider } from "./processorChain";

export const englishProcessor: ProcessorProvider<void> = () => async (speechText) => {
  return {
    ...speechText,
    text: replaceEnglishRead(speechText.text),
  };
};
