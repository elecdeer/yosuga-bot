/* eslint-disable */
// prettier-ignore
import { AspidaClient, BasicHeaders, dataToURLString } from 'aspida'
// prettier-ignore
import { Methods as Methods0 } from '.'

// prettier-ignore
const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')
  const PATH0 = '/accent_phrases'
  const POST = 'POST'

  return {
    /**
     * テキストからアクセント句を得ます。
     * is_kanaが`true`のとき、テキストは次のようなAquesTalkライクな記法に従う読み仮名として処理されます。デフォルトは`false`です。
     * * 全てのカナはカタカナで記述される
     * * アクセント句は`/`または`、`で区切る。`、`で区切った場合に限り無音区間が挿入される。
     * * カナの手前に`_`を入れるとそのカナは無声化される
     * * アクセント位置を`'`で指定する。全てのアクセント句にはアクセント位置を1つ指定する必要がある。
     * @returns Successful Response
     */
    post: (option?: { query?: Methods0['post']['query'], config?: T }) =>
      fetch<Methods0['post']['resBody'], BasicHeaders, Methods0['post']['status']>(prefix, PATH0, POST, option).json(),
    /**
     * テキストからアクセント句を得ます。
     * is_kanaが`true`のとき、テキストは次のようなAquesTalkライクな記法に従う読み仮名として処理されます。デフォルトは`false`です。
     * * 全てのカナはカタカナで記述される
     * * アクセント句は`/`または`、`で区切る。`、`で区切った場合に限り無音区間が挿入される。
     * * カナの手前に`_`を入れるとそのカナは無声化される
     * * アクセント位置を`'`で指定する。全てのアクセント句にはアクセント位置を1つ指定する必要がある。
     * @returns Successful Response
     */
    $post: (option?: { query?: Methods0['post']['query'], config?: T }) =>
      fetch<Methods0['post']['resBody'], BasicHeaders, Methods0['post']['status']>(prefix, PATH0, POST, option).json().then(r => r.body),
    $path: (option?: { method: 'post'; query: Methods0['post']['query'] }) =>
      `${prefix}${PATH0}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
  }
}

// prettier-ignore
export type ApiInstance = ReturnType<typeof api>
// prettier-ignore
export default api
