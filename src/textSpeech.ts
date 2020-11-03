import {Message} from "discord.js";
import {emojiProcessor, guildEmojiProcessor, urlProcessor} from "./processor";
import {pushSpeech, ServerConfig, Session, SpeechParam} from "./index";


export const handleText = async (message: Message, session: Session, config: ServerConfig) => {
	// console.log(message);

	//読み上げ

	console.log("handleText");

	// console.log(session);
	if(!session) return;

	// console.log(message.content);
	// console.log(message.cleanContent);
	// console.log(message.embeds);


	let baseText = message.cleanContent;

	// console.log("lastTime: " + session.textChannel.lastMessage?.createdTimestamp);
	// console.log("messageTime: " + message.createdTimestamp);

	if(message.attachments.size > 0){
		baseText = baseText + " " + message.attachments.map(attachment => attachment.url).toString();
	}

	//名前読み上げ

	const difMs = message.createdTimestamp - session.lastMessageTimestamp;
	console.log("timeDif: " + difMs);
	if(session.lastMessageAuthorId !== message.author.id || difMs > 30000){
		baseText = `${message.member?.displayName}　${baseText}`;
	}

	const text = await
		urlProcessor(baseText)
			.then(emojiProcessor)
			.then(guildEmojiProcessor);


	pushSpeech({
		session: session,
		param: {
			Text: text,
		},
		timestamp: message.createdTimestamp,
		authorId: message.author.id
	});

}