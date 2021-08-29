import {
  existsPronunciation,
  getEmojiRegExp,
  getPronunciation,
} from "@elecdeer/emoji-pronunciation-ja";

import { ProcessorProvider } from "../types";
import { processorLogger } from "./processor";

const emojiReg = getEmojiRegExp();

export const emojiProcessor: ProcessorProvider<void> = () => async (speechText) => {
  // console.log("絵文字: " + speechText.match(reg));
  return {
    ...speechText,
    text: speechText.text.replace(emojiReg, (match) => {
      const pronunciation = existsPronunciation(match) ? getPronunciation(match) : "絵文字";

      processorLogger.debug(`${match} => ${pronunciation}`);
      return pronunciation;
    }),
  };
};
