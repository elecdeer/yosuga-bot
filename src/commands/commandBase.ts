import { CommandContext, CommandData } from "../types";
import { MessageEmbed } from "discord.js";

export abstract class CommandBase {
  readonly data: Readonly<CommandData>;

  protected constructor(data: CommandData) {
    this.data = data;
  }

  public abstract execute(args: string[], context: CommandContext): Promise<MessageEmbed>;

  public getTriggers(): string[] {
    const trigger = [this.data.name];
    if (this.data.alias) trigger.push(...this.data.alias);
    return trigger;
  }

  public getUsage(): string {
    return "";
  }
}
