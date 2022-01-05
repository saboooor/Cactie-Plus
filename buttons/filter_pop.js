const { MessageEmbed } = require('discord.js');
const { filter } = require('../config/emoji.json');
function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
module.exports = {
	name: 'filter_pop',
	async execute(interaction, client) {
		const player = client.manager.get(interaction.guild.id);
		const error = new MessageEmbed().setColor('RED');
		if ((!player || !player.queue.current)) {
			error.setDescription('There is no music playing.');
			return interaction.reply({ embeds: [error] });
		}
		if (!interaction.member.voice.channel) {
			error.setDescription('You must be in a voice channel!');
			return interaction.reply({ embeds: [error] });
		}
		if (interaction.member.voice.channel !== interaction.guild.me.voice.channel) {
			error.setDescription(`You must be in the same channel as ${client.user}!`);
			return interaction.reply({ embeds: [error] });
		}
		if (interaction.guild.me.voice.serverMute) return interaction.reply({ content: 'I\'m server muted!' });
		await player.clearEQ();
		await sleep(1000);
		const bands = [
			{ band: 0, gain: -0.25 },
			{ band: 1, gain: 0.48 },
			{ band: 2, gain: 0.59 },
			{ band: 3, gain: 0.72 },
			{ band: 4, gain: 0.56 },
			{ band: 5, gain: 0.15 },
			{ band: 6, gain: -0.24 },
			{ band: 7, gain: -0.24 },
			{ band: 8, gain: -0.16 },
			{ band: 9, gain: -0.16 },
			{ band: 10, gain: 0 },
			{ band: 11, gain: 0 },
			{ band: 12, gain: 0 },
			{ band: 13, gain: 0 },
			{ band: 14, gain: 0 },
		];
		await player.setEQ(...bands);
		const embed = interaction.message.embeds[0].setDescription(`${filter} Equalizer mode is now set to **Pop**.`);
		await interaction.reply({ embeds: [embed], components: interaction.message.components });
	},
};