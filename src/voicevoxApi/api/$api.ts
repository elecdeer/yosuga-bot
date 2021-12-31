/* eslint-disable */
// prettier-ignore
import { AspidaClient, BasicHeaders, dataToURLString } from 'aspida'
// prettier-ignore
import { Methods as Methods0 } from './accent_phrases'
// prettier-ignore
import { Methods as Methods1 } from './audio_query'
// prettier-ignore
import { Methods as Methods2 } from './audio_query_from_preset'
// prettier-ignore
import { Methods as Methods3 } from './cancellable_synthesis'
// prettier-ignore
import { Methods as Methods4 } from './connect_waves'
// prettier-ignore
import { Methods as Methods5 } from './mora_data'
// prettier-ignore
import { Methods as Methods6 } from './mora_length'
// prettier-ignore
import { Methods as Methods7 } from './mora_pitch'
// prettier-ignore
import { Methods as Methods8 } from './multi_synthesis'
// prettier-ignore
import { Methods as Methods9 } from './presets'
// prettier-ignore
import { Methods as Methods10 } from './speaker_info'
// prettier-ignore
import { Methods as Methods11 } from './speakers'
// prettier-ignore
import { Methods as Methods12 } from './synthesis'
// prettier-ignore
import { Methods as Methods13 } from './synthesis_morphing'
// prettier-ignore
import { Methods as Methods14 } from './version'

// prettier-ignore
const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')
  const PATH0 = '/accent_phrases'
  const PATH1 = '/audio_query'
  const PATH2 = '/audio_query_from_preset'
  const PATH3 = '/cancellable_synthesis'
  const PATH4 = '/connect_waves'
  const PATH5 = '/mora_data'
  const PATH6 = '/mora_length'
  const PATH7 = '/mora_pitch'
  const PATH8 = '/multi_synthesis'
  const PATH9 = '/presets'
  const PATH10 = '/speaker_info'
  const PATH11 = '/speakers'
  const PATH12 = '/synthesis'
  const PATH13 = '/synthesis_morphing'
  const PATH14 = '/version'
  const GET = 'GET'
  const POST = 'POST'

  return {
    accent_phrases: {
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
    },
    audio_query: {
      /**
       * クエリの初期値を得ます。ここで得られたクエリはそのまま音声合成に利用できます。各値の意味は`Schemas`を参照してください。
       * @returns Successful Response
       */
      post: (option?: { query?: Methods1['post']['query'], config?: T }) =>
        fetch<Methods1['post']['resBody'], BasicHeaders, Methods1['post']['status']>(prefix, PATH1, POST, option).json(),
      /**
       * クエリの初期値を得ます。ここで得られたクエリはそのまま音声合成に利用できます。各値の意味は`Schemas`を参照してください。
       * @returns Successful Response
       */
      $post: (option?: { query?: Methods1['post']['query'], config?: T }) =>
        fetch<Methods1['post']['resBody'], BasicHeaders, Methods1['post']['status']>(prefix, PATH1, POST, option).json().then(r => r.body),
      $path: (option?: { method: 'post'; query: Methods1['post']['query'] }) =>
        `${prefix}${PATH1}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
    },
    audio_query_from_preset: {
      /**
       * クエリの初期値を得ます。ここで得られたクエリはそのまま音声合成に利用できます。各値の意味は`Schemas`を参照してください。
       * @returns Successful Response
       */
      post: (option?: { query?: Methods2['post']['query'], config?: T }) =>
        fetch<Methods2['post']['resBody'], BasicHeaders, Methods2['post']['status']>(prefix, PATH2, POST, option).json(),
      /**
       * クエリの初期値を得ます。ここで得られたクエリはそのまま音声合成に利用できます。各値の意味は`Schemas`を参照してください。
       * @returns Successful Response
       */
      $post: (option?: { query?: Methods2['post']['query'], config?: T }) =>
        fetch<Methods2['post']['resBody'], BasicHeaders, Methods2['post']['status']>(prefix, PATH2, POST, option).json().then(r => r.body),
      $path: (option?: { method: 'post'; query: Methods2['post']['query'] }) =>
        `${prefix}${PATH2}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
    },
    cancellable_synthesis: {
      post: (option: { body: Methods3['post']['reqBody'], query: Methods3['post']['query'], config?: T }) =>
        fetch<void, BasicHeaders, Methods3['post']['status']>(prefix, PATH3, POST, option).send(),
      $post: (option: { body: Methods3['post']['reqBody'], query: Methods3['post']['query'], config?: T }) =>
        fetch<void, BasicHeaders, Methods3['post']['status']>(prefix, PATH3, POST, option).send().then(r => r.body),
      $path: (option?: { method: 'post'; query: Methods3['post']['query'] }) =>
        `${prefix}${PATH3}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
    },
    connect_waves: {
      /**
       * base64エンコードされたwavデータを一纏めにし、wavファイルで返します。
       */
      post: (option: { body: Methods4['post']['reqBody'], config?: T }) =>
        fetch<void, BasicHeaders, Methods4['post']['status']>(prefix, PATH4, POST, option).send(),
      /**
       * base64エンコードされたwavデータを一纏めにし、wavファイルで返します。
       */
      $post: (option: { body: Methods4['post']['reqBody'], config?: T }) =>
        fetch<void, BasicHeaders, Methods4['post']['status']>(prefix, PATH4, POST, option).send().then(r => r.body),
      $path: () => `${prefix}${PATH4}`
    },
    mora_data: {
      /**
       * @returns Successful Response
       */
      post: (option: { body: Methods5['post']['reqBody'], query: Methods5['post']['query'], config?: T }) =>
        fetch<Methods5['post']['resBody'], BasicHeaders, Methods5['post']['status']>(prefix, PATH5, POST, option).json(),
      /**
       * @returns Successful Response
       */
      $post: (option: { body: Methods5['post']['reqBody'], query: Methods5['post']['query'], config?: T }) =>
        fetch<Methods5['post']['resBody'], BasicHeaders, Methods5['post']['status']>(prefix, PATH5, POST, option).json().then(r => r.body),
      $path: (option?: { method: 'post'; query: Methods5['post']['query'] }) =>
        `${prefix}${PATH5}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
    },
    mora_length: {
      /**
       * @returns Successful Response
       */
      post: (option: { body: Methods6['post']['reqBody'], query: Methods6['post']['query'], config?: T }) =>
        fetch<Methods6['post']['resBody'], BasicHeaders, Methods6['post']['status']>(prefix, PATH6, POST, option).json(),
      /**
       * @returns Successful Response
       */
      $post: (option: { body: Methods6['post']['reqBody'], query: Methods6['post']['query'], config?: T }) =>
        fetch<Methods6['post']['resBody'], BasicHeaders, Methods6['post']['status']>(prefix, PATH6, POST, option).json().then(r => r.body),
      $path: (option?: { method: 'post'; query: Methods6['post']['query'] }) =>
        `${prefix}${PATH6}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
    },
    mora_pitch: {
      /**
       * @returns Successful Response
       */
      post: (option: { body: Methods7['post']['reqBody'], query: Methods7['post']['query'], config?: T }) =>
        fetch<Methods7['post']['resBody'], BasicHeaders, Methods7['post']['status']>(prefix, PATH7, POST, option).json(),
      /**
       * @returns Successful Response
       */
      $post: (option: { body: Methods7['post']['reqBody'], query: Methods7['post']['query'], config?: T }) =>
        fetch<Methods7['post']['resBody'], BasicHeaders, Methods7['post']['status']>(prefix, PATH7, POST, option).json().then(r => r.body),
      $path: (option?: { method: 'post'; query: Methods7['post']['query'] }) =>
        `${prefix}${PATH7}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
    },
    multi_synthesis: {
      /**
       * @returns Successful Response
       */
      post: (option: { body: Methods8['post']['reqBody'], query: Methods8['post']['query'], config?: T }) =>
        fetch<Methods8['post']['resBody'], BasicHeaders, Methods8['post']['status']>(prefix, PATH8, POST, option).blob(),
      /**
       * @returns Successful Response
       */
      $post: (option: { body: Methods8['post']['reqBody'], query: Methods8['post']['query'], config?: T }) =>
        fetch<Methods8['post']['resBody'], BasicHeaders, Methods8['post']['status']>(prefix, PATH8, POST, option).blob().then(r => r.body),
      $path: (option?: { method: 'post'; query: Methods8['post']['query'] }) =>
        `${prefix}${PATH8}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
    },
    presets: {
      /**
       * エンジンが保持しているプリセットの設定を返します
       *
       * Returns
       * -------
       * presets: List[Preset]
       *     プリセットのリスト
       * @returns Successful Response
       */
      get: (option?: { config?: T }) =>
        fetch<Methods9['get']['resBody'], BasicHeaders, Methods9['get']['status']>(prefix, PATH9, GET, option).json(),
      /**
       * エンジンが保持しているプリセットの設定を返します
       *
       * Returns
       * -------
       * presets: List[Preset]
       *     プリセットのリスト
       * @returns Successful Response
       */
      $get: (option?: { config?: T }) =>
        fetch<Methods9['get']['resBody'], BasicHeaders, Methods9['get']['status']>(prefix, PATH9, GET, option).json().then(r => r.body),
      $path: () => `${prefix}${PATH9}`
    },
    speaker_info: {
      /**
       * 指定されたspeaker_uuidに関する情報をjson形式で返します。
       * 画像や音声はbase64エンコードされたものが返されます。
       *
       * Returns
       * -------
       * ret_data: SpeakerInfo
       * @returns Successful Response
       */
      get: (option: { query: Methods10['get']['query'], config?: T }) =>
        fetch<Methods10['get']['resBody'], BasicHeaders, Methods10['get']['status']>(prefix, PATH10, GET, option).json(),
      /**
       * 指定されたspeaker_uuidに関する情報をjson形式で返します。
       * 画像や音声はbase64エンコードされたものが返されます。
       *
       * Returns
       * -------
       * ret_data: SpeakerInfo
       * @returns Successful Response
       */
      $get: (option: { query: Methods10['get']['query'], config?: T }) =>
        fetch<Methods10['get']['resBody'], BasicHeaders, Methods10['get']['status']>(prefix, PATH10, GET, option).json().then(r => r.body),
      $path: (option?: { method?: 'get'; query: Methods10['get']['query'] }) =>
        `${prefix}${PATH10}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
    },
    speakers: {
      /**
       * @returns Successful Response
       */
      get: (option?: { config?: T }) =>
        fetch<Methods11['get']['resBody'], BasicHeaders, Methods11['get']['status']>(prefix, PATH11, GET, option).json(),
      /**
       * @returns Successful Response
       */
      $get: (option?: { config?: T }) =>
        fetch<Methods11['get']['resBody'], BasicHeaders, Methods11['get']['status']>(prefix, PATH11, GET, option).json().then(r => r.body),
      $path: () => `${prefix}${PATH11}`
    },
    synthesis: {
      post: (option: { body: Methods12['post']['reqBody'], query: Methods12['post']['query'], config?: T }) =>
        fetch<Methods12['post']['resBody'], BasicHeaders, Methods12['post']['status']>(prefix, PATH12, POST, option).json(),
      $post: (option: { body: Methods12['post']['reqBody'], query: Methods12['post']['query'], config?: T }) =>
        fetch<Methods12['post']['resBody'], BasicHeaders, Methods12['post']['status']>(prefix, PATH12, POST, option).json().then(r => r.body),
      $path: (option?: { method: 'post'; query: Methods12['post']['query'] }) =>
        `${prefix}${PATH12}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
    },
    synthesis_morphing: {
      /**
       * 指定された2人の話者で音声を合成、指定した割合でモーフィングした音声を得ます。
       * モーフィングの割合は`morph_rate`で指定でき、0.0でベースの話者、1.0でターゲットの話者に近づきます。
       */
      post: (option: { body: Methods13['post']['reqBody'], query: Methods13['post']['query'], config?: T }) =>
        fetch<void, BasicHeaders, Methods13['post']['status']>(prefix, PATH13, POST, option).send(),
      /**
       * 指定された2人の話者で音声を合成、指定した割合でモーフィングした音声を得ます。
       * モーフィングの割合は`morph_rate`で指定でき、0.0でベースの話者、1.0でターゲットの話者に近づきます。
       */
      $post: (option: { body: Methods13['post']['reqBody'], query: Methods13['post']['query'], config?: T }) =>
        fetch<void, BasicHeaders, Methods13['post']['status']>(prefix, PATH13, POST, option).send().then(r => r.body),
      $path: (option?: { method: 'post'; query: Methods13['post']['query'] }) =>
        `${prefix}${PATH13}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
    },
    version: {
      /**
       * @returns Successful Response
       */
      get: (option?: { config?: T }) =>
        fetch<Methods14['get']['resBody'], BasicHeaders, Methods14['get']['status']>(prefix, PATH14, GET, option).text(),
      /**
       * @returns Successful Response
       */
      $get: (option?: { config?: T }) =>
        fetch<Methods14['get']['resBody'], BasicHeaders, Methods14['get']['status']>(prefix, PATH14, GET, option).text().then(r => r.body),
      $path: () => `${prefix}${PATH14}`
    }
  }
}

// prettier-ignore
export type ApiInstance = ReturnType<typeof api>
// prettier-ignore
export default api
