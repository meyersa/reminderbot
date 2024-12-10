const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");
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
 * Load in events from JSON and filter out invalid ones
 */
function getEvents() {
  console.log("Getting events");

  var dateEvents = JSON.parse(fs.readFileSync("events.json"));
  dateEvents = dateEvents.filter((item) => isValidTitle(item.title) && isValidDate(item.date));

  if (dateEvents.length === 0) {
    throw "dateEvents cannot be empty";
  }

  console.log(`Returning ${dateEvents.length} events`);
  return dateEvents;
}

/*
 * Function to build an embed
 */
function buildEmbed(event) {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(event.title)
    .setDescription(`Event date: ${event.date}`)
    .setTimestamp()
    .setFooter({ text: "Event Information", iconURL: "https://i.imgur.com/AfFp7pu.png" });
}

/*
 * Function to find an existing bot message or send a new embed
 */
async function getOrSend(client, channelId, embed) {
  try {
    const channel = await client.channels.fetch(channelId);

    if (!channel || !channel.isTextBased()) {
      console.log("Channel is not a valid text channel.");
      return null;
    }

    // Fetch the most recent 10 messages
    const messages = await channel.messages.fetch({ limit: 10 });

    // Look for a message sent by the bot
    let botMessage = messages.find((msg) => msg.author.id === client.user.id);

    // If no message is found, send a new embed
    if (!botMessage) {
      const sentMessage = await channel.send({ embeds: [embed] });
      console.log(`Sent new message ID: ${sentMessage.id}`);
      return sentMessage.id;
    } else {
      console.log(`Existing message ID: ${botMessage.id}`);
      return botMessage.id;
    }
  } catch (error) {
    console.error("Error fetching/sending messages:", error);
    return null;
  }
}

// Load events
const dateEvents = getEvents();

require('dotenv').config();

// Discord client setup
const token = process.env.CLIENT_TOKEN;
const channelId = process.env.CHANNEL_ID;


const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Use the first event from the events array as an example
  const event = dateEvents[0];
  const embed = buildEmbed(event);

  // Call getOrSend function
  const messageId = await getOrSend(client, channelId, embed);
  console.log(`Final message ID: ${messageId}`);
});

// Log in the bot
client.login(token);