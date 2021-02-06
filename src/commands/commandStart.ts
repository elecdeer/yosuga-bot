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
		if(session){
			//既に接続済み
			if(session.textChannel.id === channel.id){
				//同じテキストルーム
				const embed = createEmbedBase()
					.setDescription("接続済みです");
				await channel.send(embed);

				return;
			}else{
				//別テキストルーム
				await session.textChannel.send(createEmbedBase().setDescription(`読み上げチャンネルが${channel.name}に変更されました`));

				session.textChannel = channel;
				await channel.send(createEmbedBase().setDescription(`接続しました!`));

				return;
			}
		}else{
			const session = new Session(message.member.voice.channel, channel, message.guild)
			await session.connectVoiceChannel();

			const embed = createEmbedBase()
				.setDescription("接続しました！");

			await channel.send(embed);
		}

	}else{
		const embed = createEmbedBase()
			.setDescription("先にボイスチャンネルに入る必要があります.");

		await message.reply(embed);
	}
};

