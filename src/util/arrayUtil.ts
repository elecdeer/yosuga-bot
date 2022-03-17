/**
 * arrayをnumの数ずつに分割する
 * @param array
 * @param num
 */
export const splitArrayPerNum = <T>(array: T[], num: number): T[][] => {
  const splitNum = Math.ceil(array.length / num);
  return [...Array<T>(splitNum)].map((_, i) => array.slice(i * num, (i + 1) * num));
};
