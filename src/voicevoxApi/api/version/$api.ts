/* eslint-disable */
// prettier-ignore
import { AspidaClient, BasicHeaders } from 'aspida'
// prettier-ignore
import { Methods as Methods0 } from '.'

// prettier-ignore
const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')
  const PATH0 = '/version'
  const GET = 'GET'

  return {
    /**
     * @returns Successful Response
     */
    get: (option?: { config?: T }) =>
      fetch<Methods0['get']['resBody'], BasicHeaders, Methods0['get']['status']>(prefix, PATH0, GET, option).text(),
    /**
     * @returns Successful Response
     */
    $get: (option?: { config?: T }) =>
      fetch<Methods0['get']['resBody'], BasicHeaders, Methods0['get']['status']>(prefix, PATH0, GET, option).text().then(r => r.body),
    $path: () => `${prefix}${PATH0}`
  }
}

// prettier-ignore
export type ApiInstance = ReturnType<typeof api>
// prettier-ignore
export default api
