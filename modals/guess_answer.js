const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { yes, no, srch } = require('../lang/int/emoji.json');
module.exports = {
	name: 'guess_answer',
	ephemeral: true,
	async execute(interaction, client) {
		try {
			// Get the field and answer from the modal
			const field = interaction.components[0].components[0];
			const answer = field.custom_id;

			// Get the opponent from the embed description
			const embedJSON = interaction.message.embeds[0].toJSON();
			const host = interaction.guild.members.cache.get(embedJSON.description.split('\n')[1].replace(/\D/g, ''));

			// Create buttons and embed for the host to answer the question
			const row = new ActionRowBuilder()
				.addComponents([
					new ButtonBuilder()
						.setCustomId('guess_yes')
						.setLabel('Yes')
						.setEmoji({ id: yes })
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId('guess_no')
						.setLabel('No')
						.setEmoji({ id: no })
						.setStyle(ButtonStyle.Danger),
					new ButtonBuilder()
						.setCustomId('guess_sometimes')
						.setLabel('Sometimes')
						.setEmoji({ name: '🤷🏽' })
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('guess_finish')
						.setEmoji({ name: '🎉' })
						.setLabel('You guessed it!')
						.setStyle(ButtonStyle.Primary),
				]);
			const TwentyOneQuestions = new EmbedBuilder(embedJSON)
				.setColor(0xde4b37)
				.setDescription(`**Playing with:**\n${interaction.member}`)
				.addFields([{ name: field.value, value: `${host}\nPlease answer this question by clicking the buttons below` }])
				.setThumbnail(host.user.avatarURL())
				.setFooter({ text: `${embedJSON.footer.text.split(' ')[0] - 1} Questions left` });

			// Edit the message with the new embed and buttons
			await interaction.message.edit({ content: `${host}`, embeds: [TwentyOneQuestions], components: [row] });

			// Ping the host to and delete the ping message
			const pingmsg = await interaction.channel.send(`${host}`);
			pingmsg.delete().catch(err => client.logger.error(err.stack));

			// Create a collector for the buttons
			const filter = i => i.customId.startsWith('guess_') && i.customId != 'guess_answer' && i.member.id == host.id;
			const collector = interaction.message.createMessageComponentCollector({ filter, time: 3600000 });
			collector.on('collect', async btnint => {
				// Defer the button
				btnint.deferUpdate();

				// Get the answer from the custom id
				const guess_ans = btnint.customId.split('_')[1];

				// Set the fields for the answer selected
				if (guess_ans == 'yes') {
					TwentyOneQuestions.data.fields[TwentyOneQuestions.data.fields.length - 1].value = `<:yes:${yes}> Yes`;
				}
				if (guess_ans == 'no') {
					TwentyOneQuestions.data.fields[TwentyOneQuestions.data.fields.length - 1].value = `<:no:${no}> No`;
				}
				if (guess_ans == 'sometimes') {
					TwentyOneQuestions.data.fields[TwentyOneQuestions.data.fields.length - 1].value = '🤷🏽 Sometimes';
				}
				if (guess_ans == 'finish') {
					TwentyOneQuestions.data.fields[TwentyOneQuestions.data.fields.length - 1].value = `🎉 You guessed it!\n\n**The answer is**\n\`${answer}\``;

					// Finish the game with a positive response
					TwentyOneQuestions.setDescription(`**Host:**\n${host}\n**${interaction.member} guessed the answer!**`);
					return interaction.message.edit({ content: `${interaction.member}`, embeds: [TwentyOneQuestions], components: [] });
				}
				if (TwentyOneQuestions.toJSON().footer.text == '0 Questions left') {
					TwentyOneQuestions.data.fields[TwentyOneQuestions.data.fields.length - 1].value = `${TwentyOneQuestions.data.fields[TwentyOneQuestions.data.fields.length - 1].value}\n\n**You ran out of questions!\nThe answer was**\n\`${answer}\``;

					// End the game with a negative response
					TwentyOneQuestions.setDescription(`**Host:**\n${host}\n**${interaction.member} ran out of questions!**`);
					return interaction.message.edit({ content: `${interaction.member}`, embeds: [TwentyOneQuestions], components: [] });
				}

				// Add a button for the opponent to guess the answer
				const guessrow = new ActionRowBuilder()
					.addComponents([
						new ButtonBuilder()
							.setCustomId('guess_answer')
							.setLabel('Ask a question about the answer')
							.setEmoji({ id: srch })
							.setStyle(ButtonStyle.Primary),
					]);

				// Edit the message with the updated embed and button
				TwentyOneQuestions.setDescription(`**Host:**\n${host}\n${interaction.member} Ask a question or guess the answer.`);
				interaction.message.edit({ content: `${interaction.member}`, embeds: [TwentyOneQuestions], components: [guessrow] });

				// Ping the opponent and delete the ping message
				const pingmsg2 = await interaction.channel.send(`${interaction.member}`);
				pingmsg2.delete().catch(err => client.logger.error(err.stack));

				// Stop the answer collector
				collector.stop();
			});

			// When the answer collector stops, edit the message with a timeout message
			collector.on('end', () => {
				if (collector.collected.size == 0) interaction.message.edit({ content: `A game of ${embedJSON.title} should not last longer than an hour are you high`, components: [], embeds: [] }).catch(err => client.logger.warn(err));
			});
		}
		catch (err) { client.error(err, interaction); }
	},
};