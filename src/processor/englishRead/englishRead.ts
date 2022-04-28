import { hiraganaToKatakana } from "./hiraganaToKatakana";
import { romajiToJpRead } from "./romajiToKana";
import { splitJpEn } from "./splitJpEn";

//5文字以上
const upperCaseRuleRegex = /[A-Za-z]{5,}/;

export const replaceEnglishRead = (input: string): string => {
  const words = splitJpEn(input);
  return words
    .map((word) => {
      //5文字以上なら大文字でもローマ字変換する
      if (upperCaseRuleRegex.test(word)) {
        word = word.toLowerCase();
      }
      const { complete, kana } = romajiToJpRead(word);
      if (complete) {
        return hiraganaToKatakana(kana);
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
