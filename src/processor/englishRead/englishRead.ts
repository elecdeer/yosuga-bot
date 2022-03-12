import { romajiToJpRead } from "./romajiToKana";
import { splitJpEn } from "./splitJpEn";

export const replaceEnglishRead = (input: string): string => {
  const words = splitJpEn(input);
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

// export const englishToJpRead = (englishStr: string): string => {
//   return englishStr;
// };

//Mecabを使って分割します
