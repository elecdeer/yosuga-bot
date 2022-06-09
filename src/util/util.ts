const regexp = /[\\^$.*+?()[\]{}|]/;
const regexpGlobal = /[\\^$.*+?()[\]{}|]/g;
export const escapeRegexp = (str: string): string => {
  return str && regexp.test(str) ? str.replace(regexpGlobal, "\\$&") : str;
};

export const isInRange = (value: number, min: number, max: number): boolean => {
  return min <= value && value <= max;
};

export const minMax = (value: number, min: number, max: number): number => {
  if (value < min) return min;
  if (max < value) return max;
  return value;
};

export const remap = (
  value: number,
  lowFrom: number,
  highFrom: number,
  lowTo: number,
  highTo: number
) => {
  return lowTo + ((highTo - lowTo) * (value - lowFrom)) / (highFrom - lowFrom);
};
