import {TextChannel} from "discord.js";
import {connect} from "../index";
import {Command, command, createEmbedBase} from "../commandManager";


const handleStart: Command = async(args, message, session, config) => {
	console.log("connect");
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


command("s", "ボイスチャンネルに接続し,読み上げを開始する.", handleStart);