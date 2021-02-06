import {Command, createEmbedBase} from "../commandManager";

export const handleHelp: Command = async(args, message, session, config) => {
	const embed = createEmbedBase()
		.setDescription(".");

	embed.
}
