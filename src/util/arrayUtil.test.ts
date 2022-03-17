import { splitArrayPerNum } from "./arrayUtil";

test("splitArrayPerNum", () => {
  expect(splitArrayPerNum([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 3)).toEqual([
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [9],
  ]);

  expect(splitArrayPerNum([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 10)).toEqual([
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14, 15],
  ]);
});
