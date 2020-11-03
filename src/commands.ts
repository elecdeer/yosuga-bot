import {Message, MessageEmbed, TextChannel} from "discord.js";
import async, {ErrorCallback} from "async";
import {connect, disconnect, ServerConfig, Session, sessionStateMap, speech, SpeechParam} from "./index";

type Command = (args: Array<string>,message: Message, session: Session, config: ServerConfig) => Promise<void>;


const commandMap: Record<string, Command> = {};

const command = (commandText: string, action: Command) => {
	commandMap[commandText] = action;
}


export const createEmbedBase = () => {
	return new MessageEmbed()
		.setTitle("Yosuga")
		.setColor(0xffb6c1);
}

const initCommands = () => {
	command("s", async (args, message, session, config) => {
		console.log("connect");
		if(! message.member) return;
		if(!message.guild) return;

		const channel = message.channel;
		if(! (channel instanceof TextChannel)) return;


		if(message.member.voice.channel){
			await connect(message.member.voice.channel, channel, message.guild);

			const embed = createEmbedBase()
				.setDescription("接続しました！");

			await channel.send(embed);
		}else {
			const embed = createEmbedBase()
				.setDescription("先にボイスチャンネルに入る必要があります.");

			await message.reply(embed);
		}
	});



	command("e", async (args, message, session, config) => {
		console.log("disconnect");

		if(!session?.connection) return;
		if(!message.guild) return;

		disconnect(session, message.guild);

		const embed = createEmbedBase()
			.setDescription("退出しました.");

		await message.channel.send(embed);
	});



}

initCommands();


export const handleCommand = async (message: Message, session: Session, config: ServerConfig) => {
	if(!message.guild) return;

	const channel = message.channel;
	if(! (channel instanceof TextChannel)) return;

	const args = message.content.slice(config.commandPrefix.length).trim().split(" ");
	const command = args.shift() || "";

	if(command in commandMap){
		await commandMap[command](args, message, session, config);
	}

}







