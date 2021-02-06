
import {Command, commandList, createEmbedBase, logger} from "./commands";


export const helpCommand: Command = {
	trigger: ["help"],
	description: "Yosugaのコマンド一覧を表示する.",
	usage: "",

	execute: async (args, message, session, config) => {
		let commands = Array.from(commandList);

		logger.debug("s" in ["s"]);
		logger.debug(["s"].indexOf("s"))

		const embed = createEmbedBase();
		embed.setDescription("Yosugaのコマンド一覧");

		if(args.length > 0){
			embed.setDescription(`Yosugaのコマンド一覧 (filter: ${args.join(", ")})`);

			//関係あるものだけ取り出す
			commands = commands.filter((command, index, self) => {
				return command.trigger.filter(trig => args.indexOf(trig) !== -1).length > 0;
			})
		}

		embed.addFields(commands.map(command => {
			const name = command.trigger.join(" | ");
			const usage = `${config.commandPrefix} ${command.trigger[0]} ${command.usage}`;

			return {
				name: name,
				value: `${command.description} \n usage: ${usage}`
			}
		}));

		await message.channel.send(embed);
	}
};