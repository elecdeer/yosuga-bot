import { test, expect } from "vitest";

import { splitJpEn } from "./splitJpEn";

test("splitJpEnによる単語分割", () => {
  expect(splitJpEn("aiueoあいうえお")).toStrictEqual(["aiueo", "あいうえお"]);

  expect(splitJpEn("JavaScriptとTypeScript")).toStrictEqual(["JavaScript", "と", "TypeScript"]);

  expect(splitJpEn("JavaScript TypeScript")).toStrictEqual(["JavaScript", " ", "TypeScript"]);

  // expect(splitJpEn("aiueoあいうえお")).toBe(["aiueo", "あいうえお"]);
});
