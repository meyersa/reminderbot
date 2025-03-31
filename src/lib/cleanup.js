import pino from "pino";
const logger = pino();

/**
 * @param {import('discord.js').TextChannel} channel
 * @param {import('../types').Event[]} events
 */
export async function cleanBotMessages(channel, events) {
    logger.info("Cleaning bot messages...");

    const messages = await channel.messages.fetch({ limit: 100 });

    const allowedIds = [
        ...events.map(e => e.message_id),
        // ...notifications.map(n => n.messageId)
    ];

    messages.forEach(message => {
        if (message.author.bot && !allowedIds.includes(message.id)) {
            message.delete().catch(err => logger.error(err, 'Failed to delete message'));
        }
    });
}