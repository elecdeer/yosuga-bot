/* eslint-disable */
import type * as Types from "../@types";

export type Methods = {
  /** クエリの初期値を得ます。ここで得られたクエリはそのまま音声合成に利用できます。各値の意味は`Schemas`を参照してください。 */
  post: {
    query?: {
      text: string;
      speaker: number;
      /** 疑問系のテキストが与えられたら自動調整する機能を有効にする。現在は長音を付け足すことで擬似的に実装される */
      enable_interrogative?: boolean;
    };

    status: 200;
    /** Successful Response */
    resBody: Types.AudioQuery;
  };
};
