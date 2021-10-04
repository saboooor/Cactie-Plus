const { MessageEmbed } = require('discord.js');
const { resume } = require('../../config/emoji.json');
const { DefaultThumbnail } = require('../../config/music.json');
const splashy = require('splashy');
const got = require('got');
module.exports = {
	name: 'resume',
	description: 'Resume currently playing music',
	aliases: ['r'],
	guildOnly: true,
	player: true,
	inVoiceChannel: true,
	sameVoiceChannel: true,
	djRole: true,
	async execute(message, args, client) {
		const player = client.manager.get(message.guild.id);
		const song = player.queue.current;
		if (!player.queue.current) {
			const thing = new MessageEmbed()
				.setColor('RED')
				.setDescription('There is no music playing.');
			return message.reply({ embeds: [thing] });
		}
		if (!player.paused) {
			const thing = new MessageEmbed()
				.setColor('RED')
				.setDescription(`${resume} The player is already **resumed**.`)
				.setTimestamp();
			return message.reply({ embeds: [thing] });
		}
		player.pause(false);
		let img = song.displayThumbnail ? song.displayThumbnail('hqdefault') : DefaultThumbnail;
		if (!img) img = DefaultThumbnail;
		const { body } = await got(img, { encoding: null });
		const palette = await splashy(body);
		const thing = new MessageEmbed()
			.setDescription(`${resume} **Resumed**\n[${song.title}](${song.uri})`)
			.setColor(palette[3])
			.setTimestamp()
			.setThumbnail(img);
		return message.reply({ embeds: [thing] });
	},
};