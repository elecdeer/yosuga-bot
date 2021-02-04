import {Message} from "discord.js";
import {ProcessorChain} from "./processor";
import log4js from 'log4js';
import {Session} from "./session";
import {ServerConfig} from "./guildConfig";
import {urlProcessor} from "./processor/urlProcessoor";
import {emojiProcessor} from "./processor/emojiProcessor";
import {guildEmojiProcessor} from "./processor/guildEmojiProcessor";
import {codeBlockProcessor} from "./processor/codeBlockProcessor";
import {maxLengthProcessor} from "./processor/MaxLengthProcessor";

const logger = log4js.getLogger("text");


const processor = new ProcessorChain()
	.use(maxLengthProcessor(500))
	.use(urlProcessor())
	.use(emojiProcessor())
	.use(guildEmojiProcessor())
	.use(codeBlockProcessor());



export const handleText = async (message: Message, session: Session, config: ServerConfig) => {
	// console.log(message);

	//読み上げ

	logger.debug("handleText");

	// console.log(session);
	if(!session) return;

	logger.debug(`content: ${message.content}  escape: ${escape(message.content)}`);
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

	const text = await processor.process(baseText);

	logger.debug(`text: ${text}`);

	session.pushSpeech({
		Text: text,
	}, message.createdTimestamp, message.author.id);


}