import { parseEvents, toEventType } from "./lib/parsing.js";
import { configDotenv } from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { send_embeds } from "./lib/embed.js";

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

async function main() {
  console.log(`Parsed ${events.length} events`);

  console.log("Sending embeds");
  await send_embeds(client, events, interval) 

  // Refresh on interval
  setInterval(async () => {
    console.log("Refreshing embeds...");
    await send_embeds(client, events, interval);
  }, interval * 1000);
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await main() 

});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith("refresh_")) {
    await interaction.deferUpdate();

    const message_id = interaction.customId.split("_")[1]
    console.log(`Manual refresh triggered for ${message_id}`);

    await send_embeds(client, events, interval, message_id)
  }
});
