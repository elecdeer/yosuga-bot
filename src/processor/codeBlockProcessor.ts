import {processorLogger, TextProcessor} from "../processor";

const codeBlockReg = /```(.*\n?)*```/g;

export const codeBlockProcessor: TextProcessor = async text => {
	processorLogger.debug(text);
	processorLogger.debug("matches", text.match(codeBlockReg));

	return text.replace(codeBlockReg, "コードブロック");
}
