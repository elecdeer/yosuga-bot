import { hiraganaToKatakana } from "./hiraganaToKatakana";

test("hiraganaToKatakanaによるひらがなカタカナ変換", () => {
  expect(hiraganaToKatakana("あいうえお")).toBe("アイウエオ");

  expect(hiraganaToKatakana("すてぃっく")).toBe("スティック");

  expect(hiraganaToKatakana("ゔぁいおりん")).toBe("ヴァイオリン");
});
