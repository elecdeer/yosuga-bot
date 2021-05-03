import { ProcessorProvider } from "../types";

const tildeRegex = /(?<![0-9０-９一二三四五六七八九〇])[〜~](?![0-9０-９一二三四五六七八九〇])/gm;

export const tildeReplaceProcessor: ProcessorProvider<void> = () => async (speechText) => {
  return {
    ...speechText,
    text: speechText.text.replace(tildeRegex, "ー"),
  };
};
