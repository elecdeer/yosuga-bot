import axios from "axios";
import RGI_Emoji from "emoji-regex";
import {processorLogger, ProcessorProvider, TextProcessor} from "../processor";

let emojiAnnotation: Record<string, string>;

(async() => {
	const res = await axios.get("https://raw.githubusercontent.com/elecdeer/emoji-pronunciation-ja/master/data/pronunciation.json");
	// console.log(json);
	emojiAnnotation = res.data;
})();

const emojiReg = RGI_Emoji();

export const emojiProcessor: ProcessorProvider<void> = () => async text => {
	// console.log("絵文字: " + text.match(reg));

	return text.replace(emojiReg, (match => {
		processorLogger.debug(`${match} => ${emojiAnnotation[match]}`);
		return emojiAnnotation[match];
	}))
}