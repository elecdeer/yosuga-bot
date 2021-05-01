/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import urlRegex from "url-regex-safe";
import httpStatus from "http-status";
import axios from "axios";
import ogs from "open-graph-scraper";
import { processorLogger } from "./processor";
import { ProcessorProvider } from "../types";

const LinkType = {
  Image: "画像",
  GifImage: "ジフ画像",
  ValidUrl: "URL省略",
  OGUrl: "URL",
  InvalidUrl: "不明なURL",
} as const;

type LinkType = typeof LinkType[keyof typeof LinkType];

const urlReg = urlRegex({});
const urlRegGrouped = new RegExp(`(${urlReg.source})`, urlReg.flags);

export const urlProcessor: ProcessorProvider<number> = (fastSpeedScale) => async (speechText) => {
  const split = speechText.text.split(urlRegGrouped).filter((str) => str && str !== "");

  // const urls = split.filter((str) => urlReg.test(str));
  // const urlsRead = await Promise.all(
  //   urls.map(async (url) => {
  //     const urlType = await checkUrlType(url);
  //     return urlType.read ?? urlType.type;
  //   })
  // );

  const splitReplaced = await Promise.all(
    split.map(async (item) => {
      if (!urlReg.test(item))
        return {
          fast: false,
          text: item,
        };

      const urlType = await checkUrlType(item);
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

const checkUrlType: (url: string) => Promise<{ type: LinkType; read?: string }> = async (url) => {
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
    const ogRes = await ogs({
      url: "",
      html: res.data as string,
    });

    if (ogRes.error) {
      return { type: LinkType.ValidUrl };
    } else {
      return {
        type: LinkType.ValidUrl,
        read: `URL ${ogRes.result.ogTitle}`,
      };
    }
    // processorLogger.debug(ogRes.result);
  }

  return { type: LinkType.InvalidUrl };
};
