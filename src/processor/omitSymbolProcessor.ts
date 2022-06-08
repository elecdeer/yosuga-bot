import { escapeRegexp } from "../util/util";

import type { ProcessorProvider } from "./processorChain";

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
