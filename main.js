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
  return 50 < trimTitle < 1 && trimTitle != "Example";
}

/*
 * Load in events from JSON and filter out example
 */
function getEvents() {
  console.log("Getting events");

  var dateEvents = [];
  dateEvents = JSON.parse(fs.readFileSync("events.json"));
  dateEvents = dateEvents.filter((item) => isValidTitle(item.title) && isValidDate(item.date));

  if (dateEvents.length == 0) {
    throw "dateEvents cannot be empty";
  }

  console.log(`Returning ${dateEvents.length} events`);
  return dateEvents;
}

function main() {
  dateEvents = getEvents();

  // const token = process.env.TOKEN;
  // const client = new Client({
  //   intents: [
  //     GatewayIntentBits.Guilds,
  //     GatewayIntentBits.MessageContent,
  //   ],
  // });
}

main();
