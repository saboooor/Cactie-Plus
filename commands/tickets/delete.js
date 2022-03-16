const { EmbedBuilder } = require('discord.js');
const getTranscript = require('../../functions/getTranscript.js');
module.exports = {
	name: 'delete',
	description: 'Delete a ticket',
	permission: 'Administrator',
	botperm: 'ManageChannels',
	async execute(message, user, client, reaction) {
		try {
			let author = message.member.user;
			if (reaction) {
				if (message.author.id != client.user.id) return;
				author = user;
			}
			if (message.channel.name.startsWith(`Subticket${client.user.username.split(' ')[1] ? client.user.username.split(' ')[1] : ''} `) && message.channel.parent.name.startsWith(`ticket${client.user.username.split(' ')[1] ? client.user.username.split(' ')[1].toLowerCase() : ''}-`)) return message.reply({ content: `This is a subticket!\nYou must use this command in ${message.channel.parent}` });

			// Check if ticket is an actual ticket
			const ticketData = (await client.query(`SELECT * FROM ticketdata WHERE channelId = '${message.channel.id}'`))[0];
			if (!ticketData) return message.reply({ content: 'Could not find this ticket in the database, please manually delete this channel.' });
			if (ticketData.users) ticketData.users = ticketData.users.split(',');
			if (message.channel.name.startsWith(`ticket${client.user.username.split(' ')[1] ? client.user.username.split(' ')[1].toLowerCase() : ''}-`)) return message.reply({ content: 'This ticket needs to be closed first!' });

			// Check if ticket log channel is set in settings
			const srvconfig = await client.getData('settings', 'guildId', message.guild.id);
			if (srvconfig.logchannel != 'false') {
				// Get transcript of ticket
				await message.reply({ content: 'Creating transcript...' });
				const messages = await message.channel.messages.fetch({ limit: 100 });
				const link = await getTranscript(messages);

				// Get list of users for embed
				const users = [];
				await ticketData.users.forEach(userid => users.push(message.guild.members.cache.get(userid).user));

				// Create embed
				const DelEmbed = new EmbedBuilder()
					.setColor(Math.floor(Math.random() * 16777215))
					.setTitle(`Deleted ${message.channel.name}`)
					.addFields({ name: '**Users in ticket**', value: `${users}` })
					.addFields({ name: '**Transcript**', value: `${link}.txt` })
					.addFields({ name: '**Deleted by**', value: `${author}` });

				// Send embed to ticket log channel
				await message.guild.channels.cache.get(srvconfig.logchannel).send({ embeds: [DelEmbed] });
				client.logger.info(`Created transcript of ${message.channel.name}: ${link}.txt`);
			}

			// Actually delete ticket and ticket database
			client.delData('ticketdata', 'channelId', message.channel.id);
			client.logger.info(`Deleted ticket #${message.channel.name}`);
			await message.channel.delete();
		}
		catch (err) { client.error(err, message); }
	},
};