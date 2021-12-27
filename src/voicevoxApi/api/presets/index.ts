/* eslint-disable */
import type * as Types from "../@types";

export type Methods = {
  /**
   * エンジンが保持しているプリセットの設定を返します
   *
   * Returns
   * -------
   * presets: List[Preset]
   *     プリセットのリスト
   */
  get: {
    status: 200;
    /** Successful Response */
    resBody: Types.Preset[];
  };
};
