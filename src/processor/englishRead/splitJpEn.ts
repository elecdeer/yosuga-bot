const wordSeparatorRegExp = /(\w+)/g;
const spaceSeparatorRegExp = /(\s+)/g;
export const splitJpEn = (input: string): string[] => {
  return input
    .split(wordSeparatorRegExp)
    .reduce<string[]>((prev, cur) => {
      return [...prev, ...cur.split(spaceSeparatorRegExp)];
    }, [])
    .filter((item) => !!item);
};
