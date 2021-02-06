import urlRegex from "url-regex";
import httpStatus from "http-status";
import axios, {AxiosResponse} from "axios";
import {processorLogger, ProcessorProvider, TextProcessor} from "../processor";

const LinkType = {
	Image: "画像",
	GifImage: "ジフ画像",
	ValidUrl: "URL省略",
	InvalidUrl: "無効なURL",
} as const;

type LinkType = typeof LinkType[keyof typeof LinkType];

const urlReg = urlRegex({

});

export const urlProcessor: ProcessorProvider<void> = () => async text => {
	const urls = text.match(urlReg);

	if(! urls) return text;

	processorLogger.debug("urlProcessor");
	processorLogger.debug(urls);

	//元のurlと置換後の文字列のtuple
	const replaceTuple: Array<[string, string]> = await Promise.all(
		urls.map(async url => {
			const urlType = await checkUrlType(url);
			const urlObj = new URL(url);

			const altText = urlType === LinkType.ValidUrl ? urlObj.hostname.replace(/^www./, "") : urlType;

			return [url, altText] as [string, string];
		})
	);

	return replaceTuple.reduce((result: string, next:[string, string]) => {
		return result.replace(next[0], next[1]);
	}, text);

}

const redirectStatus = [
	httpStatus.MOVED_PERMANENTLY,
	httpStatus.FOUND,
	httpStatus.SEE_OTHER
]

const checkUrlType = async (url: string) => {
	return axios.head(url)
		.then((res: AxiosResponse<AxiosResponse>) => {
			// console.log(res);
			processorLogger.debug(`status: ${res.status} content-type: ${res.headers["content-type"]}`);

			//怪しい
			if(redirectStatus.includes(res.status)){
				return new Promise((resolve, reject) => {
					checkUrlType(res.headers["Location"])
						.then(result => {
							resolve(result);
						})
				});
			}

			const urlObj = new URL(url);
			if(urlObj.hostname === "tenor.com"){
				return LinkType.GifImage;
			}

			if(res.headers["content-type"] === "image/gif"){
				return LinkType.GifImage;
			}else if(res.headers["content-type"].startsWith("image")){
				return LinkType.Image;
			}else{
				return LinkType.ValidUrl;
			}
		})
		.catch(() => {
			return LinkType.InvalidUrl;
		});
}




