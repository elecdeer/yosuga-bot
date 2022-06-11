const wordSeparatorRegExp = /(\w+)/g;
const spaceSeparatorRegExp = /(\s+)/g;
export const splitJpEn = (input: string): string[] => {
  return input
    .split(wordSeparatorRegExp)
    .flatMap((value) => value.split(spaceSeparatorRegExp))
    .filter((item) => item !== "");
};
