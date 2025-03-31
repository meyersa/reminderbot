import { parseEvents, toEventType } from "./lib/parsing.js";
import { configDotenv } from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { send_embeds } from "./lib/embed.js";
import { snooze_notification, dismiss_notification, check_notifications } from "./lib/notification.js";
import pino from "pino";

configDotenv();
const logger = pino({ level: "info" });
const token = process.env.CLIENT_TOKEN;
const interval = parseInt(process.env.INTERVAL) || 60;

if (!token) {
  logger.error("CLIENT_TOKEN not set in environment!");
  process.exit(1);
}

const rawEvents = parseEvents();
const events = toEventType(rawEvents);
logger.info(`Loaded ${events.length} events`);

/**
 * Refreshes embeds and checks notifications
 * @param {Client} client
 * @param {string|null} notificationId
 */
async function refresh(client, notificationId = null) {
  try {
    logger.info(`Refreshing embeds${notificationId ? ` for ID ${notificationId}` : ""}`);
    await send_embeds(client, events, interval, notificationId);
    await check_notifications(client, events);
  } catch (error) {
    logger.error("Error during refresh:", error);
  }
}

/**
 * Handle button interactions safely
 * @param {Interaction} interaction
 * @param {Client} client
 */
async function handleInteraction(interaction, client) {
  if (!interaction.isButton()) return;

  try {
    const [action, notificationId] = interaction.customId.split("_");

    if (!notificationId) return;

    if (action === "refresh") {
      logger.info(`Manual refresh triggered for ${notificationId}`);
      await refresh(client, notificationId);
    } else if (action === "snooze") {
      if (snooze_notification(notificationId, events)) {
        logger.info(`Notification ${notificationId} snoozed`);
        await interaction.message.delete();
        await interaction.reply({ content: "🔕 Snoozed for 1 day.", ephemeral: true });
      } else {
        logger.warn(`Notification ${notificationId} not found for snooze`);
      }
    } else if (action === "defer") {
      if (dismiss_notification(notificationId, events)) {
        logger.info(`Notification ${notificationId} dismissed`);
        await interaction.message.delete();
        await interaction.reply({ content: "✅ Notification dismissed.", ephemeral: true });
      } else {
        logger.warn(`Notification ${notificationId} not found for dismiss`);
      }
    }

    await interaction.deferUpdate();
  } catch (error) {
    logger.error("Error handling interaction:", error);
    try {
      await interaction.reply({ content: "⚠ An error occurred.", ephemeral: true });
    } catch {}
  }
}

/**
 * Set up the Discord client
 */
function setupClient() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  });

  client.once("ready", async () => {
    try {
      logger.info(`Logged in as ${client.user.tag}`);
      await refresh(client);
      setInterval(() => refresh(client), interval * 1000);
    } catch (error) {
      logger.error("Error during onReady:", error);
    }
  });

  client.on("interactionCreate", (interaction) => handleInteraction(interaction, client));

  client.login(token).catch((err) => {
    logger.error("Failed to login", err);
    process.exit(1);
  });

  return client;
}

/**
 * Main Entrypoint
 */
async function main() {
  logger.info("Starting bot...");
  setupClient();
}

main();
