/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import urlRegex from "url-regex-safe";
import httpStatus from "http-status";
import axios from "axios";
import ogs from "open-graph-scraper";
import { processorLogger } from "./processor";
import { ProcessorProvider } from "../types";

import { codeToString, convert } from "encoding-japanese";

const LinkType = {
  Image: "画像",
  GifImage: "ジフ画像",
  ValidUrl: "URL省略",
  OGUrl: "URL",
  InvalidUrl: "不明なURL",
} as const;

type LinkType = typeof LinkType[keyof typeof LinkType];

const urlRegStr = urlRegex({ returnString: true });
const urlReg = new RegExp(urlRegStr, "iu");
const urlRegGrouped = new RegExp(`(${urlRegStr})`, urlReg.flags);

export const urlProcessor: ProcessorProvider<number> = (fastSpeedScale) => async (speechText) => {
  const split = speechText.text.split(urlRegGrouped).filter((str) => str && str !== "");

  const splitReplaced = await Promise.all(
    split.map(async (item) => {
      const testResult = urlReg.test(item);
      processorLogger.debug(`urlRegTest: [${item}] result: ${testResult}`);
      if (!testResult) {
        processorLogger.debug(`not url`);
        return {
          fast: false,
          text: item,
        };
      }

      const urlType = await checkUrlType(item);
      processorLogger.debug(`url`);
      return {
        fast: true,
        text: urlType.read ?? urlType.type,
      };
    })
  );

  processorLogger.debug("urlProcessor");
  processorLogger.debug(split);
  processorLogger.debug(splitReplaced);

  return splitReplaced.map((item) => {
    const speed = item.fast ? speechText.speed * fastSpeedScale : speechText.speed;
    return {
      ...speechText,
      speed: speed,
      text: item.text,
    };
  });
};

const redirectStatus = [httpStatus.MOVED_PERMANENTLY, httpStatus.FOUND, httpStatus.SEE_OTHER];
const tenorOmitRegex = / -.*$/;

const checkUrlType: (url: string) => Promise<{ type: LinkType; read?: string }> = async (url) => {
  processorLogger.debug(`checkUrlType: ${url}`);
  if (!url) return { type: LinkType.InvalidUrl };

  processorLogger.debug(`check: ${url}`);

  const res = await axios({
    method: "GET",
    url: encodeURI(url),
    validateStatus: (status) => 200 <= status || status < 400,
    timeout: 2000,
    headers: {
      "User-Agent": "bot",
    },
    responseType: "arraybuffer",
  }).catch((err: Error) => err);
  if (res instanceof Error) {
    return { type: LinkType.InvalidUrl };
  }

  //リダイレクト
  if (redirectStatus.includes(res.status)) {
    return checkUrlType(res.headers["Location"]);
  }

  const contentType = String(res.headers["content-type"]);
  if (contentType === "image/gif") {
    return { type: LinkType.GifImage };
  }
  if (contentType.startsWith("image")) {
    return { type: LinkType.Image };
  }

  if (contentType.startsWith("text/html")) {
    const html = codeToString(convert(res.data, "UNICODE"));

    const ogRes = await ogs({
      url: "",
      html: html,
    });

    if (ogRes.error) {
      return { type: LinkType.ValidUrl };
    } else {
      const urlObj = new URL(url);
      if (urlObj.hostname === "tenor.com") {
        const read = ogRes.result.ogTitle?.replace(tenorOmitRegex, "");
        return {
          type: LinkType.GifImage,
          read: read,
        };
      }

      return {
        type: LinkType.OGUrl,
        read: `${LinkType.OGUrl} ${ogRes.result.ogTitle}`,
      };
    }
    // processorLogger.debug(ogRes.result);
  }

  return { type: LinkType.InvalidUrl };
};
