require("dotenv").config();
const fs = require("fs");
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { EmbedBuilder } = require("discord.js");

import { isValidDate, isValidTitle } from "./lib/helpers";





/*
 * Build the embed
 */
export function buildEmbed(event, nextRefresh) {
  const { upcoming, largestUpcoming, stats, exact } = calculateAnniversaryInfo(event.date);

  const description =
    largestUpcoming.days <= 10
      ? `**${largestUpcoming.label}** is coming up in **${largestUpcoming.days} days**!`
      : `${largestUpcoming.label} is not upcoming within 10 days.`;

  return new EmbedBuilder()
    .setTitle(`${event.title}, ${new Date(event.date).toLocaleDateString()}`)
    .setDescription(description)
    .addFields(
      {
        name: "Upcoming",
        value: upcoming.map((u) => `\`${u.label}\` (in ${u.days} days)`).join("\n"),
        inline: false,
      },
      { name: "Stats", value: stats.join("\n"), inline: false },
      { name: "Exact", value: exact.join("\n"), inline: false }
    )
    .setColor(getEmbedColor(largestUpcoming))
    .setFooter({
      text: `Last refreshed: ${new Date().toLocaleTimeString()} | Next refresh: ${new Date(
        Date.now() + nextRefresh * 1000
      ).toLocaleTimeString()}`,
    });
}

/*
 * Load events from JSON and validate
 */
export function getEvents() {
  console.log("Getting events");
  var dateEvents = JSON.parse(fs.readFileSync("events.json"));
  return dateEvents.filter((item) => isValidTitle(item.title) && isValidDate(item.date));
}

/*
 * Create refresh button
 */
export function createRefreshButton() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("refresh_embed")
      .setLabel("Refresh")
      .setStyle(ButtonStyle.Primary)
  );
}

/*
 * Find an existing message or send a new one
 */
export async function getOrSend(client, channelId, embeds) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      console.log("Channel is not a valid text channel.");
      return null;
    }
    const messages = await channel.messages.fetch({ limit: 10 });
    let botMessage = messages.find((msg) => msg.author.id === client.user.id);
    const components = [createRefreshButton()];

    if (botMessage) {
      await botMessage.edit({ embeds: embeds, components });
      console.log(`Edited existing message ID: ${botMessage.id}`);
    } else {
      const sentMessage = await channel.send({ embeds: embeds, components });
      console.log(`Sent new message ID: ${sentMessage.id}`);
    }
  } catch (error) {
    console.error("Error fetching/sending/editing messages:", error);
  }
}

/*
 * Refresh embed at regular intervals
 */
export async function refreshEmbeds(client, channelId, interval) {
  const dateEvents = getEvents();
  console.log("Sending initial embeds...");
  const initialEmbeds = dateEvents.map((event) => buildEmbed(event, interval));
  await getOrSend(client, channelId, initialEmbeds);

  setInterval(async () => {
    console.log("Refreshing embeds...");
    const embeds = dateEvents.map((event) => buildEmbed(event, interval));
    await getOrSend(client, channelId, embeds);
  }, interval * 1000);
}

// Discord client setup
if (require.main == module) {
  const token = process.env.CLIENT_TOKEN;
  const channelId = process.env.CHANNEL_ID;
  const interval = parseInt(process.env.INTERVAL) || 60; // Default to 60 seconds

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);
    refreshEmbeds(client, channelId, interval);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "refresh_embed") {
      await interaction.deferUpdate();
      console.log("Manual refresh triggered.");
      const dateEvents = getEvents();
      const embeds = dateEvents.map((event) => buildEmbed(event, interval));
      await interaction.editReply({ embeds: embeds, components: [createRefreshButton()] });
    }
  });

  client.login(token);
}
