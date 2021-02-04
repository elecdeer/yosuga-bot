import {Command, createEmbedBase} from "../commandManager";

export const handleEnd: Command  = async (args, message, session, config) => {
	console.log("disconnect");

	if(!session?.connection) return;
	if(!message.guild) return;

	session.disconnect();

	const embed = createEmbedBase()
		.setDescription("退出しました.");

	await message.channel.send(embed);
};

