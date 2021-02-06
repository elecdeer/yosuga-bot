import {Command, createEmbedBase, logger} from "../commandManager";


export const handleClear: Command = async (args, message, session, config) => {
	logger.debug("handleClear");

	if(!session?.connection) return;

	session.connection.dispatcher.destroy();
	session.initializeQueue();

	const embed = createEmbedBase().setDescription("読み上げキューをクリアしました");
	await session.textChannel.send(embed);
}