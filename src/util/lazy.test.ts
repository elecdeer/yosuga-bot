import { test, expect, describe } from "vitest";

import { resolveLazy } from "./lazy";

describe("resolveLazyが正しく動作するか", () => {
  test("プリミティブな値", () => {
    expect(resolveLazy(0)).toBe(0);
    expect(resolveLazy(true)).toBe(true);
    expect(resolveLazy("str")).toEqual("str");
  });

  test("valueなしの関数", () => {
    expect(resolveLazy(() => 0)).toBe(0);
    expect(resolveLazy(() => true)).toBe(true);
    expect(resolveLazy(() => "str")).toBe("str");

    const func = () => "ret";
    expect(resolveLazy(() => func)).toBe(func);
  });

  test("valueありの関数", () => {
    expect(resolveLazy((value) => value, 0)).toBe(0);
    expect(resolveLazy((value) => value, true)).toBe(true);
    expect(resolveLazy((value) => value, "str")).toBe("str");

    const func = () => "ret";
    expect(resolveLazy((value) => value, func)).toBe(func);
  });
});

// describe("resolveLazyParamが正しく動作するか", () => {
//   describe("値", () => {
//     test("引数省略", () => {
//       expect(
//         resolveLazyParam({
//           str: "aaa",
//           num: 0,
//           bool: true,
//         })
//       ).toEqual({
//         str: "aaa",
//         num: 0,
//         bool: true,
//       });
//     });
//
//     test("引数指定", () => {
//       expect(
//         resolveLazyParam(
//           {
//             str: "aaa",
//             num: 0,
//             bool: true,
//           },
//           ["str"]
//         )
//       ).toEqual({
//         str: "aaa",
//         num: 0,
//         bool: true,
//       });
//     });
//   });
//
//   describe("関数", () => {
//     test("引数省略", () => {
//       expect(
//         resolveLazyParam({
//           str: () => "aaa",
//           num: () => 0,
//           bool: () => true,
//         })
//       ).toEqual({
//         str: "aaa",
//         num: 0,
//         bool: true,
//       });
//     });
//
//     test("引数指定", () => {
//       const numFunc = () => 0;
//       const boolFunc = () => true;
//       expect(
//         resolveLazyParam(
//           {
//             str: () => "aaa",
//             num: numFunc,
//             bool: boolFunc,
//           },
//           ["str"]
//         )
//       ).toEqual({
//         str: "aaa",
//         num: numFunc,
//         bool: boolFunc,
//       });
//     });
//   });
// });
