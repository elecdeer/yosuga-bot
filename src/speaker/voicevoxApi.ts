import aspida from "@aspida/axios";
import axios from "axios";

import api from "../voicevoxApi/api/$api";

import type { AxiosRequestConfig } from "axios";

export const createVoicevoxClient = (baseURL: string) => {
  const config: AxiosRequestConfig = {
    timeout: 10000,
    baseURL: baseURL,
  };
  return api(aspida(axios, config));
};
