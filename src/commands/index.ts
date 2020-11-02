import { Client, Message } from 'discord.js';
import _ from 'lodash';
import config from '../util/config';

export abstract class MessageHandler {
    protected client: Client | undefined;
    protected db: FirebaseFirestore.Firestore | undefined;
    private generalChildren: MessageHandler[];
    private commandChildren: CommandHandler[];

    public constructor() {
        this.generalChildren = [];
        this.commandChildren = [];
    }

    public connect(client: Client, db: FirebaseFirestore.Firestore) {
        this.client = client;
        this.db = db;

        this.generalChildren.forEach(mh => mh.connect(client, db));
        this.commandChildren.forEach(ch => ch.connect(client, db));
    }

    public registerMessageHandler(child: MessageHandler) {
        if (this.client !== undefined && this.db !== undefined) {
            child.connect(this.client, this.db);
            this.generalChildren.push(child);
        } else {
            throw new Error('Could not link message handler child. Invoke connect() first.')
        }
    }

    public registerCommandHandler(child: CommandHandler) {
        this.commandChildren.push(child);
    }

    public async handleMessage(msg: Message) {
        if (!this.client || !this.db) {
            throw new Error('Could not handle message. Invoke connect() first.');
        }

        // This handler
        // TODO: determine whether to await or not
        this.handle(msg);

        // General message handlers
        this.generalChildren.forEach(mh => mh.handleMessage(msg));

        // Command handlers
        let prefix: string;
        if (msg.guild) {
            const guildConfigRef = this.db.collection('guild_configs').doc(msg.guild.id);
            const guildConfig = await guildConfigRef.get();

            if (guildConfig.exists) {
                prefix = guildConfig.data()?.prefix || config.getDefaultValue('prefix');
            } else {
                let defaultConfig = {} as any;
                config.config.configKeys.forEach(({ key, ...obj }) => {
                    defaultConfig[key] = obj.defaultValue;
                });
                guildConfigRef.set(defaultConfig);
                prefix = config.getDefaultValue('prefix') as string;
            }
        } else {
            prefix = config.getDefaultValue('prefix') as string;
        }
        this.commandChildren.forEach(ch => {
            if (ch.getRegisteredCommands().some(command => msg.content.startsWith(prefix) && command.test(msg.content.substr(prefix.length)))) {
                const parts = msg.content.substr(prefix.length + (ch.getParentCommand() ? (ch.getParentCommand()?.length || 0) + 1 : 0)).split(' ');

                ch.handleCommandMessage(msg, prefix, parts[0], parts.slice(1));
            }

            ch.handleMessage(msg);
        });
    }

    protected abstract async handle(msg: Message): Promise<any>;
}

export abstract class CommandHandler extends MessageHandler {
    private registeredCommands: RegExp[];
    public parentCommand: string | undefined;

    constructor(registeredCommands: string[], parentCommand: string | undefined = undefined) {
        super();

        if (parentCommand !== undefined) {
            this.parentCommand = parentCommand;
        }

        registeredCommands.forEach(command => console.log(`Registered command '${parentCommand ? parentCommand + ' ' : ''}${command}'`));
        this.registeredCommands = registeredCommands.map(commandPrefix => new RegExp(`^${parentCommand ? parentCommand + " " : ""}${commandPrefix}`, 'i'));
    }

    public getParentCommand() {
        return this.parentCommand;
    }

    public getRegisteredCommands() {
        return this.registeredCommands;
    }

    public async handleCommandMessage(msg: Message, prefix: string, command: string, args: string[]): Promise<any> {
        return this.handleCommand(msg, prefix, command, args);
    }

    protected async handle(msg: Message): Promise<any> {
    }

    protected abstract async handleCommand(msg: Message, prefix: string, command: string, args: string[]): Promise<any>;
}

export default class RootMessageHandler extends MessageHandler {
    protected async handle(msg: Message): Promise<any> {
    }
}