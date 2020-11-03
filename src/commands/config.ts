import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import config from '../util/config';

const oneLine = require('common-tags').oneLine;

export default class ConfigCommand extends Command {
	constructor(client : CommandoClient) {
		super(client, {
			name: 'config',
			aliases: ['cfg'],
			group: 'config',
			memberName: 'config_base',
			description: 'See or change configuration options',
			details: oneLine`
                This command is used to set the values of a configuration key.
                If no arguments are passed, the current configuration is listed.
                If only a key is passed, the value of that argument will be displayed.
                A value of 'default' can be used to reset the value to the default value.
                Use "quotation marks" to have values with spaces in them.
			`,
			examples: ['config nickname "Dr. Booth"'],

			args: [
                {
                    key: 'key',
                    label: 'key',
                    prompt: 'What configuration key would you like to change?',
                    type: 'string',
                    oneOf: config.getKeys(),
                    default: ''
                },
                {
                    key: 'value',
                    label: 'value',
                    prompt: 'What should the new value of this key be?',
                    type: 'string',
                    default: ''
                }
            ],
            argsPromptLimit: 0 // disable prompts
		});
	}

	async run(msg: CommandoMessage, args: { key: string, value: string }) {
		return msg.reply(`Config: ${args.key} ${args.value}`);
	}
};