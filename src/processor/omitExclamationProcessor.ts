import { ProcessorProvider } from "../types";

const omitRegexEn = /!!*/gm;
const omitRegexJp = /！！*/gm;

export const omitExclamationProcessor: ProcessorProvider<void> = () => async (speechText) => {
  return {
    ...speechText,
    text: speechText.text.replace(omitRegexEn, "!").replace(omitRegexJp, "！"),
  };
};
