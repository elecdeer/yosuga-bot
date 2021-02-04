//サーバのカスタム絵文字
import {processorLogger, TextProcessor} from "../processor";
import {client} from "../index";

const guildEmojiReg = /<:.+:\d+>/g;
export const guildEmojiProcessor: TextProcessor = async text => {


	return text.replace(guildEmojiReg, str => {



		const match = str.match(/\d+/);
		if(!match) return str;
		const emojiId = match[0];
		const emoji = client.emojis.resolve(emojiId);

		processorLogger.debug(emojiId, emoji?.name);

		return emoji?.name ?? "emoji";
	})
}