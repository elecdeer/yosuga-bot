import {disconnect} from "../index";
import {Command, command, createEmbedBase} from "../commandManager";

export const handleEnd: Command  = async (args, message, session, config) => {
	console.log("disconnect");

	if(!session?.connection) return;
	if(!message.guild) return;

	disconnect(session, message.guild);

	const embed = createEmbedBase()
		.setDescription("退出しました.");

	await message.channel.send(embed);
};

