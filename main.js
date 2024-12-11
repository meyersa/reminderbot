require("dotenv").config();
const fs = require("fs");
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

/*
 * Function to validate date
 * - Should be valid when parsed with Date
 * - Should not equal nothing
 */
function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date) && dateString.trim() !== "";
}

/*
 * Function to validate Title
 * - Should be less than 50 char
 * - Should be greater than 1 char
 * - Should not be "Example"
 */
function isValidTitle(title) {
  const trimTitle = title.trim();
  return trimTitle.length > 1 && trimTitle.length < 50 && trimTitle !== "Example";
}

/*
 * Calculate dynamic upcoming dates and elapsed time
 */
function calculateAnniversaryInfo(eventDate) {
  const now = new Date();
  const event = new Date(eventDate);
  let stats = [];
  let exact = [];
  let upcoming = [];
  let largestUpcoming = null;

  // Calculate exact differences
  const diffTime = now - event;

  let seconds = Math.floor(diffTime / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);
  let weeks = Math.floor(days / 7);
  let years = Math.floor(days / 365);
  let months = Math.floor(days / 30.44); // Approximate months

  // Remaining time calculations
  const overflowDays = days % 365;
  const remainingMonths = Math.floor(overflowDays / 30.44);
  const remainingDays = Math.floor(overflowDays % 30.44);
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  // Upcoming milestones
  const daysToNextYear = 365 - (days % 365);
  const daysToNextMonth = 30 - (days % 30);
  const daysToNextWeek = 7 - (days % 7);

  upcoming.push({ label: `${years + 1} Year${years > 0 ? "s" : ""}`, days: daysToNextYear });
  upcoming.push({ label: `${months + 1} Month${months > 0 ? "s" : ""}`, days: daysToNextMonth });
  upcoming.push({ label: `${weeks + 1} Week${weeks > 0 ? "s" : ""}`, days: daysToNextWeek });

  // Select the most meaningful upcoming milestone (Year > Month > Week), avoiding smaller increments
  upcoming.sort((a, b) => a.days - b.days); // Sort milestones by closest days first

  // Logic to prioritize increments based on the current elapsed time
  if (days < 365) {
    if (days < 30) {
      // If less than a month has passed, prioritize weeks
      largestUpcoming = upcoming.find(event => event.label.includes('Week') && event.days > 0) || upcoming[0];
    } else {
      // If less than a year has passed, prioritize months
      largestUpcoming = upcoming.find(event => event.label.includes('Month') && event.days > 0) || upcoming[0];
    }
  } else {
    // If a year or more has passed, prioritize years
    largestUpcoming = upcoming.find(event => event.label.includes('Year') && event.days > 0) || upcoming[0];
  }

  // Exact breakdown
  exact.push(`\`${years}\` Years, \`${remainingMonths}\` Months, \`${remainingDays}\` Days, \`${remainingHours}\` Hours, \`${remainingMinutes}\` Minutes, \`${remainingSeconds}\` Seconds`);

  // Stats breakdown
  stats.push(`\`${years}\` Years`);
  stats.push(`\`${months}\` Months`);
  stats.push(`\`${days}\` Days`);
  stats.push(`\`${hours}\` Hours`);
  stats.push(`\`${minutes}\` Minutes`);
  stats.push(`\`${seconds}\` Seconds`);

  return { upcoming, largestUpcoming, stats, exact };
}

/*
 * Determine embed color based on soonest upcoming date
 */
function getEmbedColor(largestUpcoming) {
  if (largestUpcoming.days < 5) return 0xff0000; // Red for <5 days
  if (largestUpcoming.days <= 10) return 0xffff00; // Yellow for 5-10 days
  return 0x00ff00; // Green for >10 days
}

/*
 * Build the embed
 */
function buildEmbed(event, nextRefresh) {
  const { upcoming, largestUpcoming, stats, exact } = calculateAnniversaryInfo(event.date);

  const description = largestUpcoming.days <= 10 
    ? `**${largestUpcoming.label}** is coming up in **${largestUpcoming.days} days**!`
    : `${largestUpcoming.label} is not upcoming within 10 days.`;

  return new EmbedBuilder()
    .setTitle(`${event.title}, ${new Date(event.date).toLocaleDateString()}`)
    .setDescription(description)
    .addFields(
      { name: "Upcoming", value: upcoming.map(u => `\`${u.label}\` (in ${u.days} days)`).join("\n"), inline: false },
      { name: "Stats", value: stats.join("\n"), inline: false },
      { name: "Exact", value: exact.join("\n"), inline: false }
    )
    .setColor(getEmbedColor(largestUpcoming))
    .setFooter({ text: `Last refreshed: ${new Date().toLocaleTimeString()} | Next refresh: ${new Date(Date.now() + nextRefresh * 1000).toLocaleTimeString()}` });
}

/*
 * Load events from JSON and validate
 */
function getEvents() {
  console.log("Getting events");
  var dateEvents = JSON.parse(fs.readFileSync("events.json"));
  return dateEvents.filter((item) => isValidTitle(item.title) && isValidDate(item.date));
}

/*
 * Create refresh button
 */
function createRefreshButton() {
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
async function getOrSend(client, channelId, embeds) {
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
async function refreshEmbeds(client, channelId, interval) {
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
const token = process.env.CLIENT_TOKEN;
const channelId = process.env.CHANNEL_ID;
const interval = parseInt(process.env.INTERVAL) || 60; // Default to 60 seconds

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
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
