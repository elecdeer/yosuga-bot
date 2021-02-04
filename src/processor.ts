
import {getLogger} from "log4js";

export const processorLogger = getLogger("processor");

export type TextProcessor = (text: string) => Promise<string>;
export type ProcessorProvider<T> = (arg: T) => TextProcessor;


export class ProcessorChain{
	processors: Array<TextProcessor>;

	constructor(){
		this.processors = [];
	}

	use(processor: TextProcessor){
		this.processors.push(processor);
		return this;
	}

	process(text: string){
		return this.processors.reduce((prev, cur) => {
			return prev
				.then(text => {
					processorLogger.debug(`processor: ${cur.name} text:${text}`);
					return text;
				})
				.then(cur);
		}, Promise.resolve(text));
	}
}


