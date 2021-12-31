/* eslint-disable */
import type * as Types from "../@types";
import { Readable } from "stream";

export type Methods = {
  post: {
    query: {
      speaker: number;
    };

    status: 200;
    reqBody: Types.AudioQuery;
    resBody: Readable;
  };
};
