import { test, expect } from "vitest";

import { replaceEnglishRead } from "./englishRead";

test("replaceEnglishReadによる変換", () => {
  expect(replaceEnglishRead("aiueoあいうえお")).toBe("アイウエオあいうえお");

  expect(replaceEnglishRead("藪からsuthikku")).toBe("藪からスティック");

  expect(replaceEnglishRead("一寸先はda-ku")).toBe("一寸先はダーク");
});
