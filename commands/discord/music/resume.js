function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
const { EmbedBuilder } = require('discord.js');
const compressEmbed = require('../../../functions/compressEmbed');
const { play } = require('../../../lang/int/emoji.json');
module.exports = {
	name: 'resume',
	description: 'Resume currently playing music',
	aliases: ['r', 'unpause'],
	player: true,
	playing: true,
	srvunmute: true,
	invc: true,
	samevc: true,
	async execute(message, args, client, lang) {
		try {
			// Get player and current song and check if already resumed
			const player = client.manager.get(message.guild.id);
			const song = player.queue.current;
			if (!player.paused) return client.error(lang.music.alrplaying, message, true);

			// Unpause player and reply
			player.pause(false);
			const ResEmbed = new EmbedBuilder()
				.setDescription(`<:play:${play}> **${lang.music.pause.un}**\n[${song.title}](${song.uri})`)
				.setColor(song.colors[0])
				.setThumbnail(song.img);
			const resmsg = await message.reply({ embeds: [ResEmbed] });

			// Wait 10 seconds and compress the message
			await sleep(10000);
			resmsg.edit({ embeds: [compressEmbed(ResEmbed)] }).catch(err => client.logger.error(err));
		}
		catch (err) { client.error(err, message); }
	},
};