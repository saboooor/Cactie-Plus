const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'instaboner',
	description: 'See your boner expand INSTANTLY!',
	usage: '[Someone]',
	aliases: ['instapp'],
	options: require('../options/someone.json'),
	async execute(message, args, client) {
		// Get settings and check if bonercmd is enabled
		const srvconfig = message.guild ? await client.getSettings(message.guild.id) : { bonercmd: 'true', maxppsize: '35' };
		if (srvconfig.bonercmd == 'false') return message.reply({ content: 'This command is disabled!' });

		// Get name of author, or user if specified
		const name = message.guild ? message.member.displayName : message.user.username;
		let nick = args[0] ? args[0] : name;

		// Check if arg is set and is a mention and fetch that user for the name
		if (args[0] && nick.startsWith('<@') && nick.endsWith('>')) {
			const mention = nick.includes('!') ? nick.slice(3, -1) : nick.slice(2, -1);
			nick = client.users.cache.get(mention).username;
		}

		// Randomly pick between hard or soft
		const hard = Math.round(Math.random());
		const hardtxt = hard == 1 ? 'soft' : 'hard';

		// Create initial embed
		const Embed = new MessageEmbed()
			.setColor(Math.round(Math.random() * 16777215))
			.setTitle(`${nick}'s ${hardtxt} pp size`);

		// Chance of getting a SIKE u have no pp
		if (Math.round(Math.random() * 10) == 5) {
			Embed.setDescription('SIKE').setFooter(`${nick} has no pp`);
			return message.reply({ embeds: [Embed] });
		}

		// Get random number out of the maxppsize for the amount of inches and set the description and footer to size then reply
		const random = Math.round(Math.random() * srvconfig.maxppsize);
		Embed.setDescription('8' + '='.repeat(random - 1 == -1 ? 0 : random - 1) + 'D').setFooter(`${hardtxt} pp size = ${random}"`);
		message.reply({ embeds: [Embed] });
	},
};