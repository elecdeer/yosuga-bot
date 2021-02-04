import {Message} from "discord.js";
import {codeBlockProcessor, emojiProcessor, guildEmojiProcessor, urlProcessor} from "./processor";
import log4js from 'log4js';
import {Session} from "./session";
import {ServerConfig} from "./guildConfig";

const logger = log4js.getLogger("text");

export const handleText = async (message: Message, session: Session, config: ServerConfig) => {
	// console.log(message);

	//読み上げ

	logger.debug("handleText");

	// console.log(session);
	if(!session) return;

	logger.debug(`content: ${message.content}`);
	logger.debug(`cleanContent: ${message.cleanContent}`);
	logger.debug(`embeds: ${message.embeds}`);
	logger.debug(`attachments: ${message.attachments}`);
	// logger.debug(`stickers] ${message.stickers}`);

	let baseText = message.cleanContent;

	// console.log("lastTime: " + session.textChannel.lastMessage?.createdTimestamp);
	// console.log("messageTime: " + message.createdTimestamp);

	if(message.attachments.size > 0){
		baseText = baseText + " " + message.attachments.map(attachment => attachment.url).join(" ");
	}

	logger.debug("[baseText] " + baseText);

	//名前読み上げ

	const difMs = message.createdTimestamp - session.lastMessageTimestamp;
	logger.debug("timeDif: " + difMs);
	if(session.lastMessageAuthorId !== message.author.id || difMs > 30000){
		baseText = `${message.member?.displayName}　${baseText}`;
	}

	const text = await
		urlProcessor(baseText)
			.then(emojiProcessor)
			.then(guildEmojiProcessor)
			.then(codeBlockProcessor)

	logger.debug(`text: ${text}`);

	session.pushSpeech({
		Text: text,
	}, message.createdTimestamp, message.author.id);


}