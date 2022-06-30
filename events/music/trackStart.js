const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, SelectMenuOptionBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord.js');
const { convertTime } = require('../../functions/music/convert.js');
const { shuffle, skip, pause, play, music } = require('../../lang/int/emoji.json');
module.exports = async (client, player, track) => {
	player.skipAmount = []; player.loopTrackAmount = [];
	player.loopQueueAmount = []; player.shuffleAmount = [];
	if (player.effectcurrentonly) {
		// Send empty filters to node
		await player.node.send({
			op: 'filters',
			guildId: player.guild,
		});
		player.effects = {};
		player.effectcurrentonly = false;
	}
	if (!player.voiceChannel) return;
	const guild = client.guilds.cache.get(player.guild);
	const srvconfig = await client.getData('settings', 'guildId', guild.id);
	const data = await client.query(`SELECT * FROM memberdata WHERE memberId = '${track.requester.id}'`);
	let lang = require('../../lang/English/msg.json');
	if (guild.preferredLocale.split('-')[0] == 'en') lang = require('../../lang/English/msg.json');
	else if (guild.preferredLocale.split('-')[0] == 'pt') lang = require('../../lang/Portuguese/msg.json');
	if (srvconfig.language != 'false') lang = require(`../../lang/${srvconfig.language}/msg.json`);
	if (data[0]) lang = require(`../../lang/${data[0].language}/msg.json`);
	const StartEmbed = new EmbedBuilder()
		.setDescription(`<:play:${play}> **${lang.music.track.started}** \`[${convertTime(track.duration).replace('7:12:56', 'LIVE')}]\`\n[${track.title}](${track.uri})`)
		.setFooter({ text: track.requester.tag, iconURL: track.requester.displayAvatarURL() })
		.setThumbnail(track.img)
		.setColor(track.colors[0]);

	// Add button for skip
	const row = new ActionRowBuilder()
		.addComponents([
			new ButtonBuilder()
				.setCustomId('music_shuffle')
				.setEmoji({ id: shuffle })
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId('music_pause')
				.setEmoji({ id: player.paused ? play : pause })
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId('music_skip')
				.setEmoji({ id: skip })
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setURL(`https://${client.user.username.replace(' ', '').toLowerCase()}.smhsmh.club/music`)
				.setEmoji({ id: music })
				.setLabel(lang.dashboard.name)
				.setStyle(ButtonStyle.Link),
		]);
	const row2 = new ActionRowBuilder().addComponents([
		new SelectMenuBuilder()
			.setCustomId('music_options')
			.setPlaceholder('More Controls... (EXPERIMENTAL)')
			.addOptions([
				new SelectMenuOptionBuilder()
					.setLabel('Effects')
					.setValue('music_effects')
					.setDescription('Set various effects on the music'),
				new SelectMenuOptionBuilder()
					.setLabel('Equalizer')
					.setValue('music_equalizer')
					.setDescription('Use the equalizer'),
				new SelectMenuOptionBuilder()
					.setLabel('Queue')
					.setValue('music_queue')
					.setDescription('View the queue'),
				new SelectMenuOptionBuilder()
					.setLabel('Enable SponsorBlock (EXPERIMENTAL)')
					.setValue('music_sponsorblock')
					.setDescription('Skip Non-Music Segments'),
			]),
	]);
	client.logger.info(`Started playing ${track.title} [${convertTime(track.duration).replace('7:12:56', 'LIVE')}] in ${guild.name} (Requested by ${track.requester.tag})`);
	const NowPlaying = await guild.channels.cache
		.get(player.textChannel)
		.send({ embeds: [StartEmbed], components: [row, row2] });
	player.setNowplayingMessage(NowPlaying);
	player.timeout = null;

	if (player.websockets) {
		player.websockets.forEach(ws => {
			ws.send(JSON.stringify({
				type: 'track',
				current: track,
				queue: player.queue,
			}));
		});
	}
};
