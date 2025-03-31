import { getLargestUpcoming } from "./dates.js";
import { Notification } from "../types.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import pino from "pino";
const logger = pino();

/**
 * Check and trigger notifications
 * @param {*} client - discord.js client
 * @param {*} events - list of events
 */
export async function check_notifications(client, events) {
  logger.info("Checking notifications");

  for (const event of events) {
    const eventDate = event.date;
    const dateNow = new Date();
    const largestUpcoming = getLargestUpcoming(eventDate, dateNow);

    if (largestUpcoming.in <= 5) {
      logger.info(`Found upcoming event: ${event.name}`);

      const hasActive = event.notificationsOwned.find((n) => !n.defer || (n.defer && n.nextNotifyTime <= Date.now()));
      if (!hasActive) {
        logger.info(`Creating active notification for ${event.name}`);

        const notification = new Notification(event.name, event.channelId, event.peopleToNotify);
        event.notificationsOwned.push(notification);
        await sendNotificationMessage(client, event, notification);
      }
    }
  }
}

/**
 * Send notification message to channel
 * @param {*} client
 * @param {*} event
 * @param {*} notification
 */
async function sendNotificationMessage(client, event, notification) {
  try {
    logger.info(`Sending notification message for ${event.name}`);
    const channel = await client.channels.fetch(event.channelId);
    if (!channel || !channel.isTextBased()) return;

    const mentionString = event.peopleToNotify.map((id) => `<@${id}>`).join(" ");
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`snooze_${notification.id}`)
        .setLabel("Snooze 1 Day")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`dismiss_${notification.id}`).setLabel("Dismiss").setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `🔔 Reminder for **${event.name}**!\n${mentionString}`,
      components: [buttons],
    });
  } catch (err) {
    logger.error(err, `Failed to send notification for ${event.name}`);
  }
}

/**
 * Find notification and its parent event by ID
 * @param {string} notificationId
 * @param {Array} events
 * @returns {{event: *, notification: *} | null}
 */
export function findNotification(notificationId, events) {
  logger.info(`Finding notification with ID ${notificationId}`);

  for (const event of events) {
    const notification = event.notificationsOwned.find((n) => n.id === notificationId);
    if (notification) return { event, notification };
  }
  return null;
}

/**
 * Snooze notification
 * @param {string} notificationId
 * @param {Array} events
 * @returns {boolean}
 */
export function snooze_notification(notificationId, events) {
  logger.info(`Snoozing notification ${notificationId}`);

  const result = findNotification(notificationId, events);
  if (!result) return false;

  result.notification.snooze();
  return true;
}

/**
 * Dismiss notification
 * @param {string} notificationId
 * @param {Array} events
 * @returns {boolean}
 */
export function dismiss_notification(notificationId, events) {
  logger.info(`Dismissing notification ${notificationId}`);

  const result = findNotification(notificationId, events);
  if (!result) return false;

  result.notification.dismiss(result.event);
  return true;
}
