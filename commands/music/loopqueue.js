const { MessageEmbed } = require('discord.js');
const { loop } = require('../../config/emoji.json');
module.exports = {
	name: 'loopqueue',
	description: 'Toggle queue loop',
	aliases: ['lq'],
	guildOnly: true,
	player: true,
	inVoiceChannel: true,
	sameVoiceChannel: true,
	async execute(message, args, client) {
		const player = client.manager.get(message.guild.id);
		const srvconfig = await client.getSettings(message.guild.id);
		if (srvconfig.djrole != 'false' && message.guild.roles.cache.get(srvconfig.djrole) && !message.member.roles.cache.has(srvconfig.djrole)) {
			const requiredAmount = Math.floor((message.guild.me.voice.channel.members.size - 1) / 2);
			if (!player.loopQueueAmount) player.loopQueueAmount = [];
			let alr = false;
			player.loopQueueAmount.forEach(i => { if (i == message.member.id) alr = true; });
			if (alr) return message.reply('You\'ve already voted to toggle the Queue Loop!');
			player.loopQueueAmount.push(message.member.id);
			if (player.loopQueueAmount.length < requiredAmount) return message.reply(`**Toggle Queue Loop?** \`${player.loopQueueAmount.length} / ${requiredAmount}\``);
			player.loopQueueAmount = null;
		}
		player.setQueueRepeat(!player.queueRepeat);
		const queueRepeat = player.queueRepeat ? 'Now' : 'No Longer';
		const thing = new MessageEmbed()
			.setColor(Math.round(Math.random() * 16777215))
			.setTimestamp()
			.setDescription(`${loop} **${queueRepeat} Looping the Queue**`);
		return message.reply({ embeds: [thing] });
	},
};