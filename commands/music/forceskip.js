const { MessageEmbed } = require('discord.js');
const { skip } = require('../../config/emoji.json');
const splashy = require('splashy');
const got = require('got');
module.exports = {
	name: 'forceskip',
	aliases: ['fs'],
	description: 'Force skip the currently playing song',
	guildOnly: true,
	player: true,
	inVoiceChannel: true,
	sameVoiceChannel: true,
	djRole: true,
	async execute(message, args, client) {
		const player = client.manager.get(message.guild.id);
		if (!player) return message.reply('The bot is not playing anything!');
		if (!player.queue.current) {
			const thing = new MessageEmbed()
				.setColor('RED')
				.setDescription('There is no music playing.');
			return message.reply({ embeds: [thing] });
		}
		const autoplay = player.get('autoplay');
		const song = player.queue.current;
		if (autoplay === false) {
			player.stop();
		}
		else {
			player.stop();
			player.queue.clear();
			player.set('autoplay', false);
		}
		const img = song.displayThumbnail ? song.displayThumbnail('hqdefault') : 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/musical-note_1f3b5.png';
		const { body } = await got(img, { encoding: null });
		const palette = await splashy(body);
		const thing = new MessageEmbed()
			.setDescription(`${skip} **Force Skipped**\n[${song.title}](${song.uri})`)
			.setColor(palette[3])
			.setTimestamp()
			.setThumbnail(img);
		return message.reply({ embeds: [thing] });
	},
};