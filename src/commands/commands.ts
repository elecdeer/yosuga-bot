import {Message, MessageEmbed, TextChannel} from "discord.js";


import log4js from 'log4js';
import {Session} from "../session";
import {ServerConfig} from "../guildConfig";
import {startCommand} from "./startCommand";
import {endCommand} from "./endCommand";
import {clearCommand} from "./clearCommand";

export const logger = log4js.getLogger("command");

// export type Command = (args: Array<string>,message: Message, session: Session | null, config: ServerConfig) => Promise<void>;

export type CommandExecutor = (args: Array<string>, message: Message, session: Session | null, config: ServerConfig) => Promise<void>;
export type Command = {
	trigger: string[];
	description: string;
	usage: string;
	execute: CommandExecutor
}

const commandList = new Set<Command>();
const commandExeRecord:Record<string, CommandExecutor> = {};

export const assign = (command: Command) => {
	// logger.debug(`assignCommand: ${commandText}`)
	// commandMap[commandText] = action;
	commandList.add(command);

	command.trigger.forEach(commandTrigger => {
		if(commandTrigger in commandExeRecord){
			throw new Error("コマンド名が重複しています");
		}

		commandExeRecord[commandTrigger] = command.execute;
	});

}

export const createEmbedBase = () => {
	return new MessageEmbed()
		.setTitle("Yosuga")
		.setColor(0xffb6c1);
}

export const getCommandList = () => {
	return Object.freeze(commandList);
}



export const assignCommands = () => {
	logger.debug("assign commands");
	assign(startCommand);
	assign(endCommand);
	assign(clearCommand);

	// command("e", "ボイスチャンネルから退出し,読み上げを終了する", handleEnd);
	// command("s", "ボイスチャンネルに接続し,読み上げを開始する.", handleStart);
	// command("clear", "読み上げを強制的に停止し,キューをクリアする.", handleClear);
}

export const handleCommand = async (message: Message, session: Session | null, config: ServerConfig) => {
	logger.debug("handleCommand");
	if(!message.guild) return;

	const channel = message.channel;
	if(! (channel instanceof TextChannel)) return;


	const args = message.content.slice(config.commandPrefix.length).trim().split(" ");
	const command = args.shift() ?? "";
	logger.debug(`content: ${message.content} command: ${command} args: ${args}`);

	if(command in commandExeRecord){
		await commandExeRecord[command](args, message, session, config);
	}

}







