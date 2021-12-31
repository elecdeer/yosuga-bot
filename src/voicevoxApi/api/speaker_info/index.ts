/* eslint-disable */
import type * as Types from "../@types";

export type Methods = {
  /**
   * 指定されたspeaker_uuidに関する情報をjson形式で返します。
   * 画像や音声はbase64エンコードされたものが返されます。
   *
   * Returns
   * -------
   * ret_data: SpeakerInfo
   */
  get: {
    query: {
      speaker_uuid: string;
    };

    status: 200;
    /** Successful Response */
    resBody: Types.SpeakerInfo;
  };
};
