import { parseEvents, toEventType } from "./lib/parsing.js";
import { configDotenv } from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { send_embeds } from "./lib/embed.js";
import { snooze_notification, dismiss_notification, check_notifications } from "./lib/notification.js";

configDotenv();
const token = process.env.CLIENT_TOKEN;
const interval = parseInt(process.env.INTERVAL) || 60;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});
client.login(token);

// Get events
const rawEvents = parseEvents();
const events = toEventType(rawEvents);

async function refresh(notificationId = null) {
  await send_embeds(client, events, interval, notificationId);
  await check_notifications(client, events);
}

async function main() {
  console.log(`Parsed ${events.length} events`);

  console.log("Sending embeds");
  await refresh();

  // Refresh on interval
  setInterval(async () => {
    console.log("Refreshing embeds...");
    await refresh();
  }, interval * 1000);
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await main();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const [action, notificationId] = interaction.customId.split("_");

  if (action === "refresh") {
    console.log(`Manual refresh triggered for ${notificationId}`);
    await refresh(notificationId);
  } else if (action == "snooze") {
    if (snooze_notification(notificationId, events)) {
      await interaction.message.delete();
      await interaction.reply({ content: "🔕 Snoozed for 1 day.", ephemeral: true });
    }
  } else if (action == "defer") {
    if (dismiss_notification(notificationId, events)) {
      await interaction.message.delete();
      await interaction.reply({ content: "✅ Notification dismissed.", ephemeral: true });
    }
  }

  await interaction.deferUpdate();
});
