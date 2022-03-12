import { replaceEnglishRead } from "./englishRead";

test("replaceEnglishReadによる変換", () => {
  expect(replaceEnglishRead("aiueoあいうえお")).toBe("あいうえおあいうえお");

  expect(replaceEnglishRead("藪からsuthikku")).toBe("藪からすてぃっく");

  expect(replaceEnglishRead("一寸先はda-ku")).toBe("一寸先はだーく");
});
