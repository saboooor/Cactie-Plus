const nodeactyl = require('nodeactyl');
const Client = nodeactyl.Client;
const { apikey } = require('../../../config/pterodactyl.json');
module.exports = {
	name: 'bungee',
	description: 'Chopsticks proxy console',
	aliases: ['b'],
	args: true,
	usage: '<Command>',
	async execute(message, args, client) {
		if (!client.guilds.cache.get('837116518730694678').members.cache.get(message.member.id)) return message.reply('You can\'t do that!');
		if (!client.guilds.cache.get('837116518730694678').members.cache.get(message.member.id).roles.cache.has('837119752232632380')) return message.reply('You can\'t do that!');
		Client.login('https://panel.birdflop.com', apikey, (logged_in, err) => {
			if (logged_in == false) return message.reply(`Something went wrong, please use https://panel.birdflop.com\n${err}`);
		});
		Client.sendCommand('68505ddb', args.join(' ')).catch((error) => {
			client.logger.error(error);
		});
		message.reply(`Sent command \`${args.join(' ')}\` to Bungee`);
	},
};