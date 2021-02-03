import {TextChannel} from "discord.js";
import {connect} from "../index";
import {Command, command, createEmbedBase, logger} from "../commandManager";


export const handleStart: Command = async(args, message, session, config) => {
	logger.info(`try connect: ${message.guild?.id}`);
	if(!message.member) return;
	if(!message.guild) return;

	const channel = message.channel;
	if(!(channel instanceof TextChannel)) return;


	if(message.member.voice.channel){
		await connect(message.member.voice.channel, channel, message.guild);

		const embed = createEmbedBase()
			.setDescription("接続しました！");

		await channel.send(embed);
	}else{
		const embed = createEmbedBase()
			.setDescription("先にボイスチャンネルに入る必要があります.");

		await message.reply(embed);
	}
};

