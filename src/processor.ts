import {AsyncResultCallback} from "async";
import {AxiosResponse} from "axios";

import axios from "axios";
import async from "async";
import urlRegex from "url-regex";
import RGI_Emoji from "emoji-regex";
import httpStatus from "http-status";
// const RGI_Emoji = require('emoji-regex/RGI_Emoji.js');

let emojiAnnotation: Record<string, string>;

(async() => {
	const res = await axios.get("https://raw.githubusercontent.com/elecdeer/emoji-pronunciation-ja/master/data/pronunciation.json");
	// console.log(json);
	emojiAnnotation = res.data;
})();


type TextProcessor = (text: string) => Promise<string>;


const LinkType = {
	Image: "画像",
	GifImage: "ジフ画像",
	ValidUrl: "URL省略",
	InvalidUrl: "無効なURL",
} as const;

type LinkType = typeof LinkType[keyof typeof LinkType];

const urlReg = urlRegex({

});

export const urlProcessor: TextProcessor = async text => {
	const urls = text.match(urlReg);

	console.log("urlProcessor");
	console.log(urls);

	if(! urls) return text;

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
			console.log(`status: ${res.status} content-type: ${res.headers["content-type"]}`);

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



const emojiReg = RGI_Emoji();

export const emojiProcessor: TextProcessor = async text => {
	// console.log("絵文字: " + text.match(reg));

	return text.replace(emojiReg, (match => {
		console.log(`${match} => ${emojiAnnotation[match]}`)
		return emojiAnnotation[match];
	}))
}

//サーバのカスタム絵文字
const guildEmojiReg = /<:.+:\d+>/g;
export const guildEmojiProcessor: TextProcessor = async text => {
	return text.replace(guildEmojiReg, str => {
		const match = str.match(/\w+/);
		if(!match) return str;
		return match[0];
	})
}


const codeBlockReg = /```(.*\n?)*```/g;

export const codeBlockProcessor: TextProcessor = async text => {
	console.log(text);
	console.log("matches", text.match(codeBlockReg));

	return text.replace(codeBlockReg, "コードブロック");
}

