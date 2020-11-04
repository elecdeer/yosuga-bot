import {Message, MessageEmbed, TextChannel} from "discord.js";
import {ServerConfig, Session} from "./index";
import {handleEnd} from "./commands/commandEnd";
import {handleStart} from "./commands/commandStart";


export type Command = (args: Array<string>,message: Message, session: Session, config: ServerConfig) => Promise<void>;


const commandMap: Record<string, Command> = {};

export const command = (commandText: string, discription: string, action: Command) => {
	console.log(`assignCommand: ${commandText}`);
	commandMap[commandText] = action;
}

export const createEmbedBase = () => {
	return new MessageEmbed()
		.setTitle("Yosuga")
		.setColor(0xffb6c1);
}



export const assignCommands = () => {
	command("e", "ボイスチャンネルから退出し,読み上げを終了する", handleEnd);
	command("s", "ボイスチャンネルに接続し,読み上げを開始する.", handleStart);
}

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







