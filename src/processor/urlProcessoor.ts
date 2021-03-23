import urlRegex from "url-regex";
import httpStatus from "http-status";
import axios, { AxiosResponse } from "axios";
import {
  processorLogger,
  ProcessorProvider,
  TextProcessor,
} from "../processor";
import ogs from "open-graph-scraper";
import { logger } from "../commands/commands";

const LinkType = {
  Image: "画像",
  GifImage: "ジフ画像",
  ValidUrl: "URL省略",
  OGUrl: "URL",
  InvalidUrl: "不明なURL",
} as const;

type LinkType = typeof LinkType[keyof typeof LinkType];

const urlReg = urlRegex({});

export const urlProcessor: ProcessorProvider<void> = () => async (text) => {
  const urls = text.match(urlReg);

  if (!urls) return text;

  processorLogger.debug("urlProcessor");
  processorLogger.debug(urls);

  //元のurlと置換後の文字列のtuple
  const replaceTuple: Array<[string, string]> = await Promise.all(
    urls.map(async (url) => {
      const urlType = await checkUrlType(url);
      const urlObj = new URL(url);

      const altText = urlType.read ?? urlType.type;
      return [url, altText] as [string, string];
    })
  );

  return replaceTuple.reduce((result: string, next: [string, string]) => {
    return result.replace(next[0], next[1]);
  }, text);
};

const redirectStatus = [
  httpStatus.MOVED_PERMANENTLY,
  httpStatus.FOUND,
  httpStatus.SEE_OTHER,
];

const checkUrlType: (
  url: string
) => Promise<{ type: LinkType; read?: string }> = async (url) => {
  if (!url) return { type: LinkType.InvalidUrl };

  processorLogger.debug(`check: ${url}`);

  const res = await axios({
    method: "GET",
    url: url,
    validateStatus: (status) => 200 <= status || status < 400,
    headers: {
      "User-Agent": "bot",
    },
  });

  //リダイレクト
  if (redirectStatus.includes(res.status)) {
    return checkUrlType(res.headers["Location"]);
  }

  const contentType = res.headers["content-type"];
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
