import { ProcessorProvider } from "./processorChain";

const nlRegex = /\r\n|\n/;

export const nlSplitProcessor: ProcessorProvider<void> = () => async (speechText) => {
  return speechText.text.split(nlRegex).map((text) => ({
    ...speechText,
    text: text,
  }));
};
