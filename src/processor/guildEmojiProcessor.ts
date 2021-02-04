//サーバのカスタム絵文字
import {TextProcessor} from "../processor";

const guildEmojiReg = /<:.+:\d+>/g;
export const guildEmojiProcessor: TextProcessor = async text => {
	return text.replace(guildEmojiReg, str => {
		const match = str.match(/\w+/);
		if(!match) return str;
		return match[0];
	})
}