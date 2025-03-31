import { getLargestUpcoming } from "./dates.js";
import { Notification } from "../types.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export async function check_notifications(client, events) {
  console.log("Checking notifications")

  for (const event of events) {
    const eventDate = event.date;
    const dateNow = new Date();
    const largestUpcoming = getLargestUpcoming(eventDate, dateNow);

    if (largestUpcoming.in <= 5) {
      console.log("Found upcoming events")

      const hasActive = event.notificationsOwned.find((n) => !n.defer || (n.defer && n.nextNotifyTime <= Date.now()));
      if (!hasActive) {
        console.log("Found active notification")

        const notification = new Notification(event.name, event.channelId, event.peopleToNotify);
        event.notificationsOwned.push(notification);
        await sendNotificationMessage(client, event, notification);
      }
    }
  }
}

async function sendNotificationMessage(client, event, notification) {
  console.log("Sending notification message...")

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
}

/**
 * Find notification and its parent event by ID
 */
export function findNotification(notificationId, events) {
    for (const event of events) {
        const notification = event.notificationsOwned.find(n => n.id === notificationId);
        if (notification) return { event, notification };
    }
    return null;
}

/**
 * Snooze notification
 */
export function snooze_notification(notificationId, events) {
  console.log("Snoozing message")

    const result = findNotification(notificationId, events);
    if (!result) return false;

    result.notification.snooze();
    return true;
}

/**
 * Dismiss notification
 */
export function dismiss_notification(notificationId, events) {
  console.log("Dismissing notification")

    const result = findNotification(notificationId, events);
    if (!result) return false;

    result.notification.dismiss(result.event);
    return true;
}