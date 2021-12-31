/* eslint-disable */
// prettier-ignore
import { AspidaClient, BasicHeaders, dataToURLString } from 'aspida'
// prettier-ignore
import { Methods as Methods0 } from '.'

// prettier-ignore
const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')
  const PATH0 = '/speaker_info'
  const GET = 'GET'

  return {
    /**
     * 指定されたspeaker_uuidに関する情報をjson形式で返します。
     * 画像や音声はbase64エンコードされたものが返されます。
     *
     * Returns
     * -------
     * ret_data: SpeakerInfo
     * @returns Successful Response
     */
    get: (option: { query: Methods0['get']['query'], config?: T }) =>
      fetch<Methods0['get']['resBody'], BasicHeaders, Methods0['get']['status']>(prefix, PATH0, GET, option).json(),
    /**
     * 指定されたspeaker_uuidに関する情報をjson形式で返します。
     * 画像や音声はbase64エンコードされたものが返されます。
     *
     * Returns
     * -------
     * ret_data: SpeakerInfo
     * @returns Successful Response
     */
    $get: (option: { query: Methods0['get']['query'], config?: T }) =>
      fetch<Methods0['get']['resBody'], BasicHeaders, Methods0['get']['status']>(prefix, PATH0, GET, option).json().then(r => r.body),
    $path: (option?: { method?: 'get'; query: Methods0['get']['query'] }) =>
      `${prefix}${PATH0}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
  }
}

// prettier-ignore
export type ApiInstance = ReturnType<typeof api>
// prettier-ignore
export default api
