/**
 * [begin, range)の配列を生成する
 * endの値は含まない
 * @param begin
 * @param end
 */
export const range = (begin: number, end: number): number[] =>
  Array.from({
    length: Math.floor(end - begin),
  }).map((_, i) => Math.ceil(begin) + i);
