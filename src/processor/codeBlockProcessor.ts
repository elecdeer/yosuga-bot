import { ProcessorProvider } from "./processorChain";

const codeBlockReg = /```(.*\n?)*```/g;

export const codeBlockProcessor: ProcessorProvider<void> = () => async (speechText) => {
  // processorLogger.debug(text);
  // processorLogger.debug("matches", text.match(codeBlockReg));

  return {
    ...speechText,
    text: speechText.text.replace(codeBlockReg, "コードブロック"),
  };
  // return text.replace(codeBlockReg, "コードブロック");
};
