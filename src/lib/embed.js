import { getExact, getLargestUpcoming, getStats, getUpcoming } from "./dates.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { getEmbedColor } from "./helpers.js";
import { cleanBotMessages } from "./cleanup.js";
import pino from "pino";
const logger = pino();

/**
 * Send embeds to a channel
 * @param {*} client - discord.js client
 * @param {*} events - events to be sent
 * @param {*} interval - interval period
 * @param {*} target_message_id - message_id to update only
 */
export async function send_embeds(client, events, interval, target_message_id = null) {
  logger.info("Grouping events by channel");

  const groupedEvents = {};
  for (const event of events) {
    if (target_message_id && event.message_id !== target_message_id) continue;
    if (!groupedEvents[event.channelId]) groupedEvents[event.channelId] = [];
    groupedEvents[event.channelId].push(event);
  }

  for (const [channelId, channelEvents] of Object.entries(groupedEvents)) {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) {
        logger.warn(`Channel ${channelId} is not valid.`);
        continue;
      }

      logger.info(`Cleaning bot messages for channel ${channelId}`);
      await cleanBotMessages(channel, channelEvents);

      logger.info("Building embeds");
      const embeds = channelEvents.map((event) => buildEmbed(event, interval));

      if (!channelEvents[0].message_id) {
        logger.info(`No message ID for channel ${channelId}, sending new message.`);
        const sentMessage = await channel.send({ embeds });
        channelEvents.forEach((event) => (event.message_id = sentMessage.id));
      }

      logger.info(`Editing message ${channelEvents[0].message_id}`);
      const message = await channel.messages.fetch(channelEvents[0].message_id);
      const message_button = buildRefreshButton(channelEvents[0].message_id);
      const components = [message_button];

      await message.edit({ embeds, components });
    } catch (err) {
      logger.error(err, `Failed to process embeds for channel ${channelId}`);
    }
  }
}

/**
 * Build an embed from an event
 * @param {*} event
 * @param {*} nextRefresh
 * @returns {EmbedBuilder}
 */
export function buildEmbed(event, nextRefresh) {
  const eventDate = event.date;
  const dateNow = new Date();

  logger.info(`Starting date calculations for ${event.name}`);
  const upcoming = getUpcoming(eventDate, dateNow);
  const largestUpcoming = getLargestUpcoming(eventDate, dateNow);
  const stats = getStats(eventDate, dateNow);
  const exact = getExact(eventDate, dateNow);
  logger.info(`Finished date calculations for ${event.name}`);

  const description =
    largestUpcoming.in <= 10
      ? `**${largestUpcoming.type}** is coming up in **${largestUpcoming.days} days**!`
      : `**${largestUpcoming.type}** is not upcoming within **10 days.**`;

  return new EmbedBuilder()
    .setTitle(`${event.name}, ${new Date(event.date).toLocaleDateString()}`)
    .setDescription(description)
    .addFields(
      {
        name: "Upcoming",
        value: Object.entries(upcoming)
          .map(([label, u]) => `\`${label}\` (in ${u.in} days)`)
          .join("\n"),
        inline: false,
      },
      {
        name: "Stats",
        value: `\`${stats.years}\` Years\n\`${stats.months}\` Months\n\`${stats.days}\` Days\n\`${stats.hours}\` Hours\n\`${stats.minutes}\` Minutes\n\`${stats.seconds}\` Seconds`,
        inline: false,
      },
      {
        name: "Exact",
        value: `\`${exact.years}\` Years, \`${exact.months}\` Months, \`${exact.days}\` Days, \`${exact.hours}\` Hours, \`${exact.minutes}\` Minutes, \`${exact.seconds}\` Seconds`,
        inline: false,
      }
    )
    .setColor(getEmbedColor(largestUpcoming.value))
    .setFooter({
      text: `Last refreshed: ${new Date().toLocaleTimeString()} | Next refresh: ${new Date(
        Date.now() + nextRefresh * 1000
      ).toLocaleTimeString()}`,
    });
}

/**
 * Create Refresh Buttons
 * @param {*} message_id
 * @returns {ActionRowBuilder}
 */
function buildRefreshButton(message_id) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`refresh_${message_id}`).setLabel("Refresh").setStyle(ButtonStyle.Primary)
  );
}
