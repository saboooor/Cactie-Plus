function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
const msg = require('../lang/en/msg.json');
module.exports = {
	name: 'filter_pop',
	player: true,
	serverUnmute: true,
	inVoiceChannel: true,
	sameVoiceChannel: true,
	async execute(interaction, client) {
		try {
			// Get the player and clear the EQ for 30ms (this makes the eq actually work because it doesn't apply when another eq is set)
			const player = client.manager.get(interaction.guild.id);
			await player.clearEQ();
			await sleep(30);

			// Set the EQ bands
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

			// Update the message with the new EQ
			const embed = interaction.message.embeds[0].setDescription(msg.music.eq.btn.replace('-m', msg.music.eq.pop));
			await interaction.reply({ embeds: [embed], components: interaction.message.components });
		}
		catch (err) {
			client.error(err, interaction);
		}
	},
};