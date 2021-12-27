import aspida from "@aspida/axios";
import axios, { AxiosRequestConfig } from "axios";

import api from "../voicevoxApi/api/$api";

export const createVoicevoxClient = (baseURL: string) => {
  const config: AxiosRequestConfig = {
    timeout: 3000,
    baseURL: baseURL,
  };
  return api(aspida(axios, config));
};
