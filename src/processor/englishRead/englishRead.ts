import TinySegmenter from "tiny-segmenter";

import { romajiToJpRead } from "./romajiToKana";

export const replaceEnglishRead = (input: string): string => {
  const words = splitByWord(input);
  return words
    .map((word) => {
      const { complete, kana } = romajiToJpRead(word);
      if (complete) {
        return kana;
      } else {
        return word;
      }
    })
    .join("");
};

const segmenter = new TinySegmenter();
const splitByWord = (input: string): string[] => {
  return segmenter.segment(input);
};

// export const englishToJpRead = (englishStr: string): string => {
//   return englishStr;
// };

//Mecabを使って分割します
