module.exports = async (client, player) => {
	const guild = client.guilds.cache.get(player.guild);
	logger.info(`Player has been created in ${guild ? guild.name : player.guild}`);
};