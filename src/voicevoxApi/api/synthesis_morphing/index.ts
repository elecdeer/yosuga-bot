/* eslint-disable */
import type * as Types from "../@types";

export type Methods = {
  /**
   * 指定された2人の話者で音声を合成、指定した割合でモーフィングした音声を得ます。
   * モーフィングの割合は`morph_rate`で指定でき、0.0でベースの話者、1.0でターゲットの話者に近づきます。
   */
  post: {
    query: {
      base_speaker: number;
      target_speaker: number;
      morph_rate: number;
    };

    status: 200;
    reqBody: Types.AudioQuery;
  };
};
