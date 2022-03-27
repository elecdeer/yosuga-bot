import { range } from "./range";

describe("rangeのテスト", () => {
  test("正しい配列を生成できる", () => {
    expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(range(-2, 4)).toEqual([-2, -1, 0, 1, 2, 3]);
  });

  test("小数値で指定した場合", () => {
    expect(range(0.1, 1.5)).toEqual([1]);
    expect(range(0.1, 0.8)).toEqual([]);
  });
});
