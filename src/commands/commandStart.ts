import {TextChannel} from "discord.js";
import {Command, createEmbedBase, logger} from "../commandManager";
import {Session} from "../session";
import {client} from "../index";


export const handleStart: Command = async(args, message, session, config) => {
	logger.info(`try connect: ${message.guild?.id}`);
	if(!message.member) return;
	if(!message.guild) return;

	const channel = message.channel;
	if(!(channel instanceof TextChannel)) return;


	if(message.member.voice.channel){
		const session = new Session(message.member.voice.channel, channel, message.guild)
		await session.connectVoiceChannel();

		const embed = createEmbedBase()
			.setDescription("接続しました！");

		await channel.send(embed);


		logger.debug(`emojiList: ${message.guild.emojis}`)
	}else{
		const embed = createEmbedBase()
			.setDescription("先にボイスチャンネルに入る必要があります.");

		await message.reply(embed);
	}
};

