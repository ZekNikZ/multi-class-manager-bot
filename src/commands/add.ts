import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

const oneLine = require('common-tags').oneLine;

export default class AddNumbersCommand extends Command {
	constructor(client : CommandoClient) {
		super(client, {
			name: 'add-numbers',
			aliases: ['add', 'add-nums'],
			group: 'math',
			memberName: 'add',
			description: 'Adds numbers together.',
			details: oneLine`
				This is an incredibly useful command that finds the sum of numbers.
				This command is the envy of all other commands.
			`,
			examples: ['add-numbers 42 1337'],

			args: [
				{
					key: 'numbers',
					label: 'number',
					prompt: 'What numbers would you like to add? Every message you send will be interpreted as a single number.',
					type: 'float',
					infinite: true
				}
            ],
            argsPromptLimit: 0 // disable prompts
		});
	}

	async run(msg: CommandoMessage, args: { numbers: string[] }) {
		const total = args.numbers.reduce((prev, arg) => prev + parseFloat(arg), 0);
		return msg.reply(`${args.numbers.join(' + ')} = **${total}**`);
	}
};