export const hiraganaToKatakana = (hiraganaOnlyString: string): string => {
  return Array.from(hiraganaOnlyString)
    .map((char) => {
      const charCode = char.charCodeAt(0);
      if (0x3041 <= charCode && charCode <= 0x3096) {
        return String.fromCharCode(charCode + 0x60);
      } else {
        return char;
      }
    })
    .join("");
};
