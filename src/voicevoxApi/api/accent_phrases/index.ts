/* eslint-disable */
import type * as Types from "../@types";

export type Methods = {
  /**
   * テキストからアクセント句を得ます。
   * is_kanaが`true`のとき、テキストは次のようなAquesTalkライクな記法に従う読み仮名として処理されます。デフォルトは`false`です。
   * * 全てのカナはカタカナで記述される
   * * アクセント句は`/`または`、`で区切る。`、`で区切った場合に限り無音区間が挿入される。
   * * カナの手前に`_`を入れるとそのカナは無声化される
   * * アクセント位置を`'`で指定する。全てのアクセント句にはアクセント位置を1つ指定する必要がある。
   */
  post: {
    query?: {
      text: string;
      speaker: number;
      is_kana?: boolean;
      /** 疑問系のテキストが与えられたら自動調整する機能を有効にする。現在は長音を付け足すことで擬似的に実装される */
      enable_interrogative?: boolean;
    };

    status: 200;
    /** Successful Response */
    resBody: Types.AccentPhrase[];
  };
};
