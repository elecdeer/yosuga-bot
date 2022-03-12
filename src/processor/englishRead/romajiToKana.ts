// prettier-ignore
const romajiMap: Record<string, string> = {
  a: "あ",   i: "い",   u: "う",   e: "え",   o: "お",
  ka: "か",  ki: "き",  ku: "く",  ke: "け",  ko: "こ",
  kka: "っか",  kki: "っき",  kku: "っく",  kke: "っけ",  kko: "っこ",
  sa: "さ",  si: "し",  su: "す",  se: "せ",  so: "そ",
  ssa: "っさ",  ssi: "っし",  ssu: "っす",  sse: "っせ",  sso: "っそ",
  shi: "し",
  sshi: "っし",
  ta: "た",  ti: "ち",  tu: "つ",  te: "て", to: "と",
  tta: "った",  tti: "っち",  ttu: "っつ",  tte: "って", tto: "っと",
  chi: "ち", tsu: "つ",
  cchi: "っち", tchi: "っち", ttsu: "っつ",
  na: "な",  ni: "に",  nu: "ぬ",  ne: "ね",  no: "の",
  ha: "は",  hi: "ひ",  hu: "ふ",  he: "へ",  ho: "ほ",
  hha: "っは",  hhi: "っひ",  hhu: "っふ",  hhe: "っへ",  hho: "っほ",
  fu: "ふ",
  ffu: "っふ",
  ma: "ま",  mi: "み",  mu: "む",  me: "め",  mo: "も",
  mma: "っま",  mmi: "っみ",  mmu: "っむ",  mme: "っめ",  mmo: "っも",
  ya: "や",  yu: "ゆ",  yo: "よ",
  yya: "っや",  yyu: "っゆ",  yyo: "っよ",
  ra: "ら",  ri: "り",  ru: "る",  re: "れ",  ro: "ろ",
  rra: "っら",  rri: "っり",  rru: "っる",  rre: "っれ",  rro: "っろ",
  wa: "わ",  wo: "を",  nn: "ん",
  n: "ん",
  ga: "が",  gi: "ぎ",  gu: "ぐ",  ge: "げ",  go: "ご",
  gga: "っが",  ggi: "っぎ",  ggu: "っぐ",  gge: "っげ",  ggo: "っご",
  za: "ざ",  zi: "じ",  zu: "ず",  ze: "ぜ",  zo: "ぞ",
  zza: "っざ",  zzi: "っじ",  zzu: "っず",  zze: "っぜ",  zzo: "っぞ",
  ji: "じ",
  jji: "っじ",
  da: "だ",  di: "ぢ",  du: "づ",  de: "で",  do: "ど",
  dda: "っだ",  ddi: "っぢ",  ddu: "っづ",  dde: "っで",  ddo: "っど",
  ba: "ば",  bi: "び",  bu: "ぶ",  be: "べ",  bo: "ぼ",
  bba: "っば",  bbi: "っび",  bbu: "っぶ",  bbe: "っべ",  bbo: "っぼ",
  pa: "ぱ",  pi: "ぴ",  pu: "ぷ",  pe: "ぺ",  po: "ぽ",
  ppa: "っぱ",  ppi: "っぴ",  ppu: "っぷ",  ppe: "っぺ",  ppo: "っぽ",
  kya: "きゃ",  kyu: "きゅ",  kyo: "きょ",
  kkya: "っきゃ",  kkyu: "っきゅ",  kkyo: "っきょ",
  sya: "しゃ",  sha: "しゃ",  syu: "しゅ",  shu: "しゅ",  sye: "しぇ",
  ssya: "っしゃ",  ssha: "っしゃ",  ssyu: "っしゅ",  sshu: "っしゅ",  ssye: "っしぇ",
  she: "しぇ",  syo: "しょ",  sho: "しょ",
  sshe: "っしぇ",  ssyo: "っしょ",  ssho: "っしょ",
  tya: "ちゃ",  tyi: "ちぃ",  tyu: "ちゅ",  tye: "ちぇ",  tyo: "ちょ",
  ttya: "っちゃ",  ttyi: "っちぃ",  ttyu: "っちゅ",  ttye: "っちぇ",  ttyo: "っちょ",
  tha: "ちゃ", thi: "てぃ", thu: "てゅ", the: "ちぇ", tho: "てょ",
  cha: "ちゃ",  chu: "ちゅ",  che: "ちぇ",  cho: "ちょ",
  ccha: "っちゃ",  cchu: "っちゅ",  cche: "っちぇ",  ccho: "っちょ",
  nya: "にゃ",  nyi: "にぃ",  nyu: "にゅ",  nye: "にぇ",  nyo: "にょ",
  nnya: "っにゃ",  nnyi: "っにぃ",  nnyu: "っにゅ",  nnye: "っにぇ",  nnyo: "っにょ",
  hya: "ひゃ",  hyi: "ひぃ",  hyu: "ひゅ",  hye: "ひぇ",  hyo: "ひょ",
  hhya: "っひゃ",  hhyi: "っひぃ",  hhyu: "っひゅ",  hhye: "っひぇ",  hhyo: "っひょ",
  mya: "みゃ",  myi: "みぃ",  myu: "みゅ",  mye: "みぇ",  myo: "みょ",
  mmya: "っみゃ",  mmyi: "っみぃ",  mmyu: "っみゅ",  mmye: "っみぇ",  mmyo: "っみょ",
  rya: "りゃ",  ryi: "りぃ",  ryu: "りゅ",  rye: "りぇ",  ryo: "りょ",
  rrya: "っりゃ",  rryi: "っりぃ",  rryu: "っりゅ",  rrye: "っりぇ",  rryo: "っりょ",
  gya: "ぎゃ",  gyi: "ぎぃ",  gyu: "ぎゅ",  gye: "ぎぇ",  gyo: "ぎょ",
  ggya: "っぎゃ",  ggyi: "っぎぃ",  ggyu: "っぎゅ",  ggye: "っぎぇ",  ggyo: "っぎょ",
  zya: "じゃ",  zyi: "じぃ",  zyu: "じゅ",  zye: "じぇ",  zyo: "じょ",
  zzya: "っじゃ",  zzyi: "っじぃ",  zzyu: "っじゅ",  zzye: "っじぇ",  zzyo: "っじょ",
  ja: "じゃ",   ju: "じゅ",   je: "じぇ",   jo: "じょ",
  jja: "っじゃ",   jju: "っじゅ",   jje: "っじぇ",   jjo: "っじょ",
  jya: "じゃ",  jyi: "じぃ",  jyu: "じゅ",  jye: "じぇ",  jyo: "じょ",
  jjya: "っじゃ",  jjyi: "っじぃ",  jjyu: "っじゅ",  jjye: "っじぇ",  jjyo: "っじょ",
  dya: "ぢゃ",  dyi: "ぢぃ",  dyu: "ぢゅ",  dye: "ぢぇ",  dyo: "ぢょ",
  ddya: "っぢゃ",  ddyi: "っぢぃ",  ddyu: "っぢゅ",  ddye: "っぢぇ",  ddyo: "っぢょ",
  dha: "でゃ",  dhi: "でぃ",  dhu: "でゅ",  dhe: "でぇ",  dho: "でょ",
  ddha: "っでゃ",  ddhi: "っでぃ",  ddhu: "っでゅ",  ddhe: "っでぇ",  ddho: "っでょ",
  bya: "びゃ",  byi: "びぃ",  byu: "びゅ",  bye: "びぇ",  byo: "びょ",
  bbya: "っびゃ",  bbyi: "っびぃ",  bbyu: "っびゅ",  bbye: "っびぇ",  bbyo: "っびょ",
  pya: "ぴゃ",  pyi: "ぴぃ",  pyu: "ぴゅ",  pye: "ぴぇ",  pyo: "ぴょ",
  ppya: "っぴゃ",  ppyi: "っぴぃ",  ppyu: "っぴゅ",  ppye: "っぴぇ",  ppyo: "っぴょ",
  fa: "ふぁ",   fi: "ふぃ",   fe: "ふぇ",   fo: "ふぉ",
  ffa: "っふぁ",   ffi: "っふぃ",   ffe: "っふぇ",   ffo: "っふぉ",
  fya: "ふゃ",  fyu: "ふゅ",  fyo: "ふょ",
  ffya: "っふゃ",  ffyu: "っふゅ",  ffyo: "っふょ",
  xa: "ぁ",  xi: "ぃ",  xu: "ぅ",  xe: "ぇ",  xo: "ぉ",
  xxa: "っぁ",  xxi: "っぃ",  xxu: "っぅ",  xxe: "っぇ",  xxo: "っぉ",
  xya: "ゃ",   xyu: "ゅ",   xyo: "ょ",
  xxya: "っゃ",   xxyu: "っゅ",   xxyo: "っょ",
  xtu: "っ",
  xtsu: "っ",
  wi: "うぃ",   we: "うぇ",
  wwi: "っうぃ",   wwe: "っうぇ",
  va: "ゔぁ",   vi: "ゔぃ",   vu: "ゔ",  ve: "ゔぇ",   vo: "ゔぉ",
  vva: "っゔぁ",   vvi: "っゔぃ",   vvu: "っゔ",  vve: "っゔぇ",   vvo: "っゔぉ",
  "-": "ー"
};
//コードはシンプルになる

const compileRegexFromMap = (map: Record<string, string>) => {
  const keys = Object.keys(map);
  return new RegExp(`(${keys.join("|")})`);
};

const regex = compileRegexFromMap(romajiMap);

/**
 * ローマ字をかなに変換する
 * @param romajiStr
 */
export const romajiToJpRead = (
  romajiStr: string
): {
  kana: string;
  complete: boolean;
} => {
  const split = romajiStr.split(regex).filter((item) => !!item);
  let complete = true;
  const kana = split
    .map((item) => {
      const kanaChar = romajiMap[item];
      if (kanaChar) {
        return kanaChar;
      } else {
        complete = false;
        return item;
      }
    })
    .join("");
  return {
    kana: kana,
    complete: complete,
  };
};
