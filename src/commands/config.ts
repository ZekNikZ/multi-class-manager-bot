import { Message } from 'discord.js';
import { toNumber } from 'lodash';
import { CommandHandler } from '.'
import config from '../util/config';

const registeredCommands: string[] = [
    'config',
];

class ConfigCommandHandler extends CommandHandler {
    constructor() {
        super(registeredCommands);
    }

    protected async handleCommand(msg: Message, prefix: string, command: string, args: string[]): Promise<any> {
        if (!msg.guild) {
            return msg.reply("You can't use that command here!");
        }

        if (args.length === 0) {
            switch (command) {
                case 'config':
                    msg.reply(`List of config keys: ` + config.getKeys().join(', '));
                    break;
            }
        }
    }
}

class ConfigKeyCommandHandler extends CommandHandler {
    constructor() {
        super(config.getKeys(), "config");
    }

    protected async handleCommand(msg: Message, prefix: string, command: string, args: string[]): Promise<any> {
        if (!this.client || !this.db) {
            throw new Error('Could not handle message. Invoke connect() first.');
        }

        if (!msg.guild) {
            return msg.reply("You can't use that command here!");
        }

        // Fetch server config
        const guildConfigRef = this.db.collection('guild_configs').doc(msg.guild.id);
        let guildConfig = await guildConfigRef.get();

        if (!guildConfig.exists) {
            let defaultConfig = {} as any;
            config.config.configKeys.forEach(({ key, ...obj }) => {
                defaultConfig[key] = obj.defaultValue;
            });
            await guildConfigRef.set(defaultConfig);
        }

        if (args.length === 0) {
            return msg.reply(`Current value of '${command}': ${(guildConfig.data() || {})[command] || config.getDefaultValue(command)}`);
        }

        switch(command) {
            case 'nickname':
                const newName = args.join(' ');
                if (this.client.user !== null) {
                    msg.guild.member(this.client.user)?.setNickname(newName);
                } else {
                    throw new Error('Cannot set nickname.');
                }

                if (args[0] === 'default') {
                    msg.guild.member(this.client.user)?.setNickname('');
                    this.db.collection('guild_configs').doc(msg.guild.id).set({ [command]: config.getDefaultValue(command) }, { merge: true })
                    return msg.reply(`Set config key '${command}' to default (no nickname).`)
                }

                this.db.collection('guild_configs').doc(msg.guild.id).set({ [command]: newName }, { merge: true })
                return msg.reply(`Set config key '${command}' to value: ${newName}`);
            case '':
                return;
            default:
                if (args.length !== 1) {
                    return msg.reply(`Invalid argument count. Try again with fewer arguments.`);
                }

                if (args[0] === 'default') {
                    this.db.collection('guild_configs').doc(msg.guild.id).set({ [command]: config.getDefaultValue(command) }, { merge: true })
                    return msg.reply(`Set config key '${command}' to default (${config.getDefaultValue(command)}).`)
                }

                let newVal: string | boolean | number | undefined;
                switch(config.getType(command)) {
                    case 'string':
                        newVal = args[0];
                        break;
                    case 'number':
                        newVal = toNumber(args[0]);
                        break;
                    case 'boolean':
                        newVal = args[0] === 'true';
                        break;
                    default:
                        throw new Error('Unexpected config key type.');
                }

                this.db.collection('guild_configs').doc(msg.guild.id).set({ [command]: newVal }, { merge: true })
                return msg.reply(`Set config key '${command}' to value: ${newVal}`);
        }
    }
}

const configCommandHandler = new ConfigCommandHandler();
configCommandHandler.registerCommandHandler(new ConfigKeyCommandHandler());
export default configCommandHandler;