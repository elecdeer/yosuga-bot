/* eslint-disable */
// prettier-ignore
import { AspidaClient, BasicHeaders, dataToURLString } from 'aspida'
// prettier-ignore
import { Methods as Methods0 } from '.'

// prettier-ignore
const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')
  const PATH0 = '/synthesis'
  const POST = 'POST'

  return {
    post: (option: { body: Methods0['post']['reqBody'], query: Methods0['post']['query'], config?: T }) =>
      fetch<void, BasicHeaders, Methods0['post']['status']>(prefix, PATH0, POST, option).send(),
    $post: (option: { body: Methods0['post']['reqBody'], query: Methods0['post']['query'], config?: T }) =>
      fetch<void, BasicHeaders, Methods0['post']['status']>(prefix, PATH0, POST, option).send().then(r => r.body),
    $path: (option?: { method: 'post'; query: Methods0['post']['query'] }) =>
      `${prefix}${PATH0}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
  }
}

// prettier-ignore
export type ApiInstance = ReturnType<typeof api>
// prettier-ignore
export default api
