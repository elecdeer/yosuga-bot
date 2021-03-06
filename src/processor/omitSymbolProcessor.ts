import { ProcessorProvider } from "../types";
import { escapeRegexp } from "../util";

export const omitSymbolProcessor: ProcessorProvider<string> = (symbol) => {
  const symbolEscaped = escapeRegexp(symbol);

  const regex = new RegExp(`(${symbolEscaped}){2,}`, "gm");
  return async (speechText) => {
    return {
      ...speechText,
      text: speechText.text.replace(regex, symbol),
    };
  };
};
