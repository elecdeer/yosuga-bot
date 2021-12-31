/* eslint-disable */
// prettier-ignore
import { AspidaClient, BasicHeaders } from 'aspida'
// prettier-ignore
import { Methods as Methods0 } from '.'

// prettier-ignore
const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')
  const PATH0 = '/connect_waves'
  const POST = 'POST'

  return {
    /**
     * base64エンコードされたwavデータを一纏めにし、wavファイルで返します。
     */
    post: (option: { body: Methods0['post']['reqBody'], config?: T }) =>
      fetch<void, BasicHeaders, Methods0['post']['status']>(prefix, PATH0, POST, option).send(),
    /**
     * base64エンコードされたwavデータを一纏めにし、wavファイルで返します。
     */
    $post: (option: { body: Methods0['post']['reqBody'], config?: T }) =>
      fetch<void, BasicHeaders, Methods0['post']['status']>(prefix, PATH0, POST, option).send().then(r => r.body),
    $path: () => `${prefix}${PATH0}`
  }
}

// prettier-ignore
export type ApiInstance = ReturnType<typeof api>
// prettier-ignore
export default api
