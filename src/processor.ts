import {AsyncResultCallback} from "async";
import {AxiosResponse} from "axios";

import axios from "axios";
import async from "async";

let emojiAnnotation: Record<string, string>;

(async() => {
	const res = await axios.get("https://raw.githubusercontent.com/elecdeer/emoji-pronunciation-ja/master/data/pronunciation.json");
	// console.log(json);
	emojiAnnotation = res.data;
})();


type TextProcessor = (text: string) => Promise<string>;


const LinkType = {
	Image: "画像",
	ValidUrl: "URL省略",
	InvalidUrl: "無効なURL",
} as const;
type LinkType = typeof LinkType[keyof typeof LinkType];


const urlReg = new RegExp("https?://[\\w!\\?/\\+\\-_~=;\\.,\\*&@#\\$%\\(\\)'\\[\\]]+", "igm");


export const urlProcessor: TextProcessor = async text => {
	const urls = text.match(urlReg);

	if(! urls) return text;

	return async.map(urls, (item:string, cb: AsyncResultCallback<[string, LinkType], Error>) => {
		axios.head(item)
			.then((res: AxiosResponse<AxiosResponse>) => {
				console.log(res);
				if(res.headers["content-type"].startsWith("image")){
					cb(null, [item, LinkType.Image]);
				}else{
					cb(null, [item, LinkType.ValidUrl]);
				}
			})
			.catch(() => {
				cb(null, [item, LinkType.InvalidUrl])
			});
	}).then((map: Array<[string, LinkType]>) => (
		map.reduce((result: string, item: [string, LinkType]) => (
			result.replace(item[0], item[1])
		), text)
	));
}


const emojiReg = /\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;

export const emojiProcessor: TextProcessor = async text => {
	// console.log("絵文字: " + text.match(reg));

	return text.replace(emojiReg, (match => {
		console.log(`${match} => ${emojiAnnotation[match]}`)
		return emojiAnnotation[match];
	}))

}


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

