function capFirstLetter(string) { return string.charAt(0).toUpperCase() + string.slice(1); }
const progressbar = require('../../functions/music/progressbar.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	name: 'effect',
	description: 'Add various effects to the music',
	usage: '<Cry/Echo/Pan/Timescale/Tremolo/Underwater> <Arguments>',
	args: true,
	voteOnly: true,
	player: true,
	options: require('../../options/effect.js'),
	async execute(message, args, client) {
		try {
			// Create embed
			const filterEmbed = new EmbedBuilder()
				.setColor(0x2f3136)
				.setTitle('Music effect set!');

			// Get player
			const player = client.manager.get(message.guild.id);

			// Set effect if it isn't
			player.effects = { ...player.effects };

			// Get the type
			const type = args[0].toLowerCase();
			if (type == 'cry') {
				// Check if frequency is between 0 and 14 and depth between 0 and 1
				if (args[1] && (args[1] <= 0 || args[1] > 14)) return message.reply({ content: 'The frequency must be between 0 and 14!' });
				if (args[2] && (args[2] <= 0 || args[2] > 100)) return message.reply({ content: 'The depth must be between 0 and 100!' });

				// Check if args are set
				if (isNaN(Number(args[1]))) args[1] = 14;
				if (isNaN(Number(args[2]))) args[2] = 100;

				// Set effects
				player.effects.vibrato = {
					frequency: Number(args[1]),
					depth: Number(args[2]) / 100,
				};
			}
			else if (type == 'echo') {
				// Check if delay is over 0 and decay is between 0 and 1
				if (args[1] && args[1] <= 0) return message.reply({ content: 'The delay must be higher than 0!' });
				if (args[2] && (args[2] <= 0 || args[2] > 100)) return message.reply({ content: 'The decay must be between 0 and 100!' });

				// Check if args are set
				if (isNaN(Number(args[1]))) args[1] = 0.5;
				if (isNaN(Number(args[2]))) args[2] = 0.2;

				// Set effects
				player.effects.echo = {
					delay: Number(args[1]),
					decay: Number(args[2]),
				};
			}
			else if (type == 'pan') {
				// Check if arg is set
				if (isNaN(args[1])) args[1] = 1;

				// Set effects
				player.effects.rotation = {
					rotationHz: Number(args[1]),
				};
			}
			else if (type == 'timescale') {
				// Check if speed or pitch is more than 0
				if (args[1] <= 0) return message.reply({ content: 'The speed must be more than 0! (Default: 1)' });
				if (args[2] <= 0) return message.reply({ content: 'The pitch must be more than 0! (Default: 1)' });

				if (isNaN(Number(args[1]))) args[1] = 1;
				if (isNaN(Number(args[2]))) args[2] = 1;

				// Set effects
				player.effects.timescale = {
					speed: Number(args[1]),
					pitch: Number(args[2]),
				};
			}
			else if (type == 'tremolo') {
				// Check if frequency is between 0 and 14 and depth between 0 and 1
				if (args[1] && args[1] <= 0) return message.reply({ content: 'The frequency must be higher than 0!' });
				if (args[2] && (args[2] <= 0 || args[2] > 100)) return message.reply({ content: 'The must be between 0 and 100!' });

				// Check if args are set
				if (isNaN(Number(args[1]))) args[1] = 14;
				if (isNaN(Number(args[2]))) args[2] = 100;

				// Set effects
				player.effects.tremolo = {
					frequency: Number(args[1]),
					depth: Number(args[2]) / 100,
				};
			}
			else if (type == 'underwater') {
				// Set effects
				player.effects = {
					...player.effects,
					karaoke: {
						level: 1.0,
						monoLevel: 1.0,
						filterBand: 220.0,
						filterWidth: 100.0,
					},
				};
			}
			else {
				// Return error if type is invalid
				return message.reply({ content: '**You must specify a valid effect type!**\nHere\'s a list of the effects:\n```\ncry [Frequency in Hz] [Depth in %]\necho [Delay in seconds] [Decay in %]\npan [Rotation in Hz]\ntimescale <Speed in x> <Pitch in x>\ntremolo [Frequency in Hz] [Depth in %]\nunderwater\n```' });
			}

			// Send player effects to node
			await player.node.send({
				op: 'filters',
				guildId: player.guild,
				...player.effects,
			});

			// Set fields according to effects
			Object.keys(player.effects).forEach(effect => {
				const field = { name: capFirstLetter(effect), value: '\u200b' };
				if (effect == 'vibrato') field.value = `${player.effects.vibrato.frequency} Hz, ${player.effects.vibrato.depth * 100}%`;
				else if (effect == 'echo') field.value = `${player.effects.echo.delay}s, ${player.effects.echo.decay * 100}%`;
				else if (effect == 'rotation') field.value = `${player.effects.rotation.rotationHz} Hz`;
				else if (effect == 'timescale') field.value = `${player.effects.timescale.speed}x, ${player.effects.timescale.pitch}x`;
				else if (effect == 'tremolo') field.value = `${player.effects.tremolo.frequency} Hz, ${player.effects.tremolo.depth * 100}%`;
				else if (effect == 'karaoke') field.value = 'Underwater';
				else if (effect == 'equalizer') field.value = `${player.effects.equalizer.map(b => `**${b.band}** ${progressbar(250, (b.gain * 100) + 125, 20, '▬', '🔘')}`).join('\n')}`;
				filterEmbed.addFields([field]);
			});

			// Button for only current song
			const songrow = new ActionRowBuilder()
				.addComponents([
					new ButtonBuilder()
						.setCustomId('music_effect_current')
						.setLabel('Only apply effects to current song')
						.setStyle(ButtonStyle.Secondary),
				]);
			const queuerow = new ActionRowBuilder()
				.addComponents([
					new ButtonBuilder()
						.setCustomId('music_effect_current')
						.setLabel('Apply effects to all songs')
						.setStyle(ButtonStyle.Secondary),
				]);
				// Button for clearing all effects
			const disablerow = new ActionRowBuilder()
				.addComponents([
					new ButtonBuilder()
						.setCustomId('music_effect_disable')
						.setLabel('Disable all effects')
						.setStyle(ButtonStyle.Danger),
				]);

			// Respond
			const effectMsg = await message.reply({ embeds: [filterEmbed], components: [player.effectcurrentonly ? queuerow : songrow, disablerow] });

			// Collector for current song toggle
			const filter = i => i.customId.startsWith('music_effect');
			const collector = effectMsg.createMessageComponentCollector({ filter, time: 60000 });
			collector.on('collect', async interaction => {
				await interaction.deferUpdate();
				if (interaction.customId.endsWith('current')) player.effectcurrentonly = !player.effectcurrentonly;
				if (interaction.customId.endsWith('disable')) {
					// Clear all effects
					player.effects = {};

					// Send filters to node
					await player.node.send({
						op: 'filters',
						guildId: player.guild,
						...player.effects,
					});

					// Set EQ embed
					filterEmbed.setDescription('Cleared all effects successfully!')
						.setFields([]);
				}
				return interaction.editReply({ embeds: [filterEmbed], components: [player.effectcurrentonly ? queuerow : songrow, disablerow] });
			});

			// When the collector stops, remove all buttons from it
			collector.on('end', () => {
				if (message.commandName) message.editReply({ components: [] }).catch(err => logger.warn(err));
				else effectMsg.edit({ components: [] }).catch(err => logger.warn(err));
			});
		}
		catch (err) { client.error(err, message); }
	},
};