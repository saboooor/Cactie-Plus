const { readdirSync } = require('fs');
const { Collection } = require('discord.js');
module.exports = client => {
	let amount = 0;
	client.cooldowns = new Collection();
	client.commands = new Collection();
	const commandFolders = readdirSync(`./${client.type}cmds`);
	for (const folder of commandFolders) {
		const commandFiles = readdirSync(`./${client.type}cmds/${folder}`).filter(file => file.endsWith('.js') && folder != 'message');
		for (const file of commandFiles) {
			const command = require(`../${client.type}cmds/${folder}/${file}`);
			client.commands.set(command.name, command);
			amount = amount + 1;
		}
	}
	client.logger.info(`${amount} message commands loaded`);
};