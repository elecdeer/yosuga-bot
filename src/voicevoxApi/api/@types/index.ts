/* eslint-disable */
/** アクセント句ごとの情報 */
export type AccentPhrase = {
  moras: Mora[];
  accent: number;

  pause_mora?: Mora;
};

/** 音声合成用のクエリ */
export type AudioQuery = {
  accent_phrases: AccentPhrase[];
  speedScale: number;
  pitchScale: number;
  intonationScale: number;
  volumeScale: number;
  prePhonemeLength: number;
  postPhonemeLength: number;
  outputSamplingRate: number;
  outputStereo: boolean;
  kana?: string;
};

export type HTTPValidationError = {
  detail: ValidationError[];
};

/** モーラ（子音＋母音）ごとの情報 */
export type Mora = {
  text: string;
  consonant?: string;
  consonant_length?: number;
  vowel: string;
  vowel_length: number;
  pitch: number;
};

export type ParseKanaBadRequest = {
  text: string;
  /**
   * |name|description|
   * |---|---|
   * | UNKNOWN_TEXT | 判別できない読み仮名があります: {text} |
   * | ACCENT_TOP | 句頭にアクセントは置けません: {text} |
   * | ACCENT_TWICE | 1つのアクセント句に二つ以上のアクセントは置けません: {text} |
   * | ACCENT_NOTFOUND | アクセントを指定していないアクセント句があります: {text} |
   * | EMPTY_PHRASE | {position}番目のアクセント句が空白です |
   * | INFINITE_LOOP | 処理時に無限ループになってしまいました...バグ報告をお願いします。 |
   */
  error_name: string;

  error_args: {
    [key: string]: string;
  };
};

/** プリセット情報 */
export type Preset = {
  id: number;
  name: string;
  speaker_uuid: string;
  style_id: number;
  speedScale: number;
  pitchScale: number;
  intonationScale: number;
  volumeScale: number;
  prePhonemeLength: number;
  postPhonemeLength: number;
};

/** スピーカー情報 */
export type Speaker = {
  name: string;
  speaker_uuid: string;
  styles: SpeakerStyle[];
  version?: string;
};

/** 話者の追加情報 */
export type SpeakerInfo = {
  policy: string;
  portrait: string;
  style_infos: StyleInfo[];
};

/** スピーカーのスタイル情報 */
export type SpeakerStyle = {
  name: string;
  id: number;
};

/** スタイルの追加情報 */
export type StyleInfo = {
  id: number;
  icon: string;
  voice_samples: string[];
};

export type ValidationError = {
  loc: string[];
  msg: string;
  type: string;
};
