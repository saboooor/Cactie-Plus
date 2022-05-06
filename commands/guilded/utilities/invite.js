const { EmbedBuilder } = require('discord.js');
module.exports = {
	name: 'invite',
	description: 'Get Cactie\'s invite links',
	aliases: ['inv'],
	cooldown: 10,
	async execute(message, args, client) {
		try {
			const InvEmbed = new EmbedBuilder()
				.setColor(Math.floor(Math.random() * 16777215))
				.addFields([
					{ name: '**Add Cactie Bot to your server:**', value: '[Invite Cactie to your server using this link!](https://cactie.smhsmh.club/guilded)' },
					{ name: '**Add the secondary Cactie Dev Bot:**', value: '[Invite Cactie Dev to your server using this link!](https://cactie.smhsmh.club/guildeddev)' },
					{ name: '**Bot Support:**', value: '[Join Cactie\'s guilded server!](https://guilded.gg/cactie)' },
					{ name: '**Nether Depths:**', value: '[Also check out Nether Depths!](https://guilded.gg/Nether-Depths)' },
				]);
			await message.reply({ embeds: [InvEmbed] });
		}
		catch (err) { client.error(err, message); }
	},
};