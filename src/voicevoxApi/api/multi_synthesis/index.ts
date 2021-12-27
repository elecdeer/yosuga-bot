/* eslint-disable */
import type * as Types from "../@types";

export type Methods = {
  post: {
    query: {
      speaker: number;
    };

    status: 200;
    /** Successful Response */
    resBody: Blob;
    reqBody: Types.AudioQuery[];
  };
};
