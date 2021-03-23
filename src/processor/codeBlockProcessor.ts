import { processorLogger, ProcessorProvider } from "../processor";

const codeBlockReg = /```(.*\n?)*```/g;

export const codeBlockProcessor: ProcessorProvider<void> = () => async (
  text
) => {
  // processorLogger.debug(text);
  // processorLogger.debug("matches", text.match(codeBlockReg));

  return text.replace(codeBlockReg, "コードブロック");
};
