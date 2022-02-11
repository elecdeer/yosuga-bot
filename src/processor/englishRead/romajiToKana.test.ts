import { romajiToJpRead } from "./romajiToKana";

test("ローマ字→かな#1", () => {
  expect(romajiToJpRead("aiueo")).toBe("あいうえお");
});

test("ローマ字→かな#2", () => {
  expect(romajiToJpRead("wagahaihanekodearu")).toBe("わがはいはねこである");
});

test("ローマ字→かな#3", () => {
  expect(romajiToJpRead("inta-netto")).toBe("いんたーねっと");
});

test("ローマ字→かな#4", () => {
  expect(romajiToJpRead("fattosanjuuni")).toBe("ふぁっとさんじゅうに");
});

test("ローマ字→かな#5", () => {
  expect(romajiToJpRead("mannindensha")).toBe("まんいんでんしゃ");
});

test("ローマ字→かな#6", () => {
  expect(romajiToJpRead("english")).toBe("えんglいsh");
});
