import { Message } from "discord.js";
import { MessageHandler } from ".";

export default class LoggerMessageHandler extends MessageHandler {
    protected async handle(msg: Message): Promise<any> {
        console.log(msg);
    }
}