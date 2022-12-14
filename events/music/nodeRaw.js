const { EmbedBuilder } = require('discord.js');
const convertTime = require('../../functions/music/convert.js');
const { forward } = require('../../lang/int/emoji.json');

module.exports = async (client, payload) => {
	if (payload.op == 'playerUpdate') {
		const player = client.manager.get(payload.guildId);
		if (player && player.websockets) {
			player.websockets.forEach(ws => {
				ws.send(JSON.stringify({
					type: 'progress',
					max: player.queue.current.duration,
					pos: player.position,
				}));
			});
		}
	}
	else if (payload.op == 'event' && payload.type == 'SegmentSkipped') {
		const player = client.manager.get(payload.guildId);
		const guild = client.guilds.cache.get(player.guild);
		const channel = guild.channels.cache.get(player.textChannel);
		const BlockEmbed = new EmbedBuilder()
			.setColor('Random')
			.setDescription(`<:forward:${forward}> **Skipped ${payload.segment.category}**\nfrom \`${convertTime(payload.segment.start)}\` to \`${convertTime(payload.segment.end)}\``);
		await channel.send({ embeds: [BlockEmbed] });
		logger.info(`Skipped ${payload.segment.category} from ${convertTime(payload.segment.start)} to ${convertTime(payload.segment.end)} in ${guild.name}`);
	}
};