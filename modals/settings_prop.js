module.exports = {
	name: 'settings_prop',
	deferReply: true,
	ephemeral: true,
	async execute(interaction, client) {
		try {
			// Get the field and setting from the modal
			const field = interaction.components[0].components[0];
			let value = field.value;
			const prop = field.custom_id;

			// If the value is blank, set to false
			if (value == '') value = 'false';
			// No spaces in disabledcmds or auditlogs
			if (prop == 'disabledcmds' || prop == 'auditlogs') value = value.replace(/ /g, '');
			// Check if auditlog has supported logs
			if (prop == 'auditlogs' && value != 'false') {
				value = value.replace(/\n/g, '').toLowerCase();
				const logs = value.split(',');
				const categories = {
					member: ['memberjoin', 'memberleave'],
					channel: ['channelcreate', 'channeldelete'],
					voice: ['voicejoin', 'voiceleave', 'voicemove', 'voicedeafen', 'voicemute', 'voiceserverdeafen', 'voiceservermute'],
					other: ['all'],
				};
				const list = Object.keys(categories).map(key => { return `${key}:\n${categories[key].join(', ')}`; }).join('\n\n');
				for (const log of logs) if (![...Object.keys(categories), ...Object.values(categories).flat()].includes(log)) return client.error(`${log} is not a valid log type!\nThe valid log types are:\n\n${list}\n\nYou may also put the category names to select everything in the category`, interaction, true);
			}
			// Leavemessage / Joinmessage can only be enabled if the systemChannel is set (may change later to a separate setting)
			if ((prop == 'leavemessage' || prop == 'joinmessage') && !interaction.guild.systemChannel && value != 'false') return client.error(`Please set a system channel in ${interaction.guild.name} settings first!`, interaction, true);
			// Msgshortener can only be a number
			if ((prop == 'msgshortener' || prop == 'maxppsize') && isNaN(value)) return client.error('That\'s not a valid number!', interaction, true);
			// Maxppsize can only be less than 76
			if (prop == 'maxppsize' && value > 76) return client.error('"maxppsize" must be 75 or less!', interaction, true);

			// Set the new value and reply
			await client.setData('settings', 'guildId', interaction.guild.id, prop, value);
			client.logger.info(`Successfully set ${prop} to ${value} in ${interaction.guild.name}`);
			interaction.reply({ content: `**Successfully set ${prop} to \`${value}\`!**` });
		}
		catch (err) { client.error(err, interaction); }
	},
};