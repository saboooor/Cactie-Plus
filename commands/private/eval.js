module.exports = {
	name: 'eval',
	description: 'Runs code specified in args',
	aliases: ['ec'],
	args: true,
	usage: '<Code>',
	cooldown: 0.1,
	async execute(message, args, client) {
		// Check if user is sab lolololol
		if (message.author.id !== '249638347306303499') return client.error('You can\'t do that!', message, true);
		try {
			const code = args.join(' ');
			let evaled = eval(code);
			if (typeof evaled !== 'string') { evaled = require('util').inspect(evaled); }
			message.reply({ content: evaled });
		}
		catch (err) { client.error(err, message, true); }
	},
};
