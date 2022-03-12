import { romajiToJpRead } from "./romajiToKana";

test("ローマ字→かな#1", () => {
  expect(romajiToJpRead("aiueo")).toEqual({
    kana: "あいうえお",
    complete: true,
  });
});

test("ローマ字→かな#2", () => {
  expect(romajiToJpRead("wagahaihanekodearu")).toEqual({
    kana: "わがはいはねこである",
    complete: true,
  });
});

test("ローマ字→かな#3", () => {
  expect(romajiToJpRead("inta-netto")).toEqual({
    kana: "いんたーねっと",
    complete: true,
  });
});

test("ローマ字→かな#4", () => {
  expect(romajiToJpRead("fattosanjuuni")).toEqual({
    kana: "ふぁっとさんじゅうに",
    complete: true,
  });
});

test("ローマ字→かな#5", () => {
  expect(romajiToJpRead("mannindensha")).toEqual({
    kana: "まんいんでんしゃ",
    complete: true,
  });
});

test("ローマ字→かな#6", () => {
  expect(romajiToJpRead("english")).toEqual({
    kana: "えんglいsh",
    complete: false,
  });
});
