
require("dotenv").config();

import log4js from 'log4js';
import Discord, {Client} from "discord.js";
import axios from "axios";

import {setHandler} from "./eventHandler";
import {assignCommands} from "./commands/commands";

log4js.configure({
	appenders: {
		out: {type: "stdout"},
		app: {type: "file", filename: "yosuga.log"},
		wrapErr: {type: "logLevelFilter", appender: "app", level: "warn"}
	},
	categories: {
		default: {
			appenders: ["out", "app"],
			level: "all"
		},

	}
});

const logger = log4js.getLogger();

logger.info("start process");
logger.debug("environment", process.env);


export const client: Client = new Discord.Client();
axios.defaults.baseURL = process.env.VOICEROID_DEAMON_URL;






setHandler(client);
assignCommands();

client.login(process.env.DISCORD_TOKEN).then(res => {
	logger.info("bot login");
	logger.info(`token: ${res}`);

});


process.on("exit", function() {
	logger.info("Exit...");
	log4js.shutdown();
	client.destroy();
	logger.info("Destroy");
})
process.on("SIGINT", function () {
	process.exit(0);
});
