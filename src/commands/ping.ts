import { Message } from 'discord.js';
import { CommandHandler } from '.'

const registeredCommands: string[] = [
    'ping',
];

export default class PingCommandHandler extends CommandHandler {
    public constructor() {
        super(registeredCommands);
    }

    protected async handleCommand(msg: Message, prefix: string, command: string, args: string[]): Promise<any> {
        switch (command) {
            case 'ping':
                msg.reply('pong!');
                break;
        }
    }
}