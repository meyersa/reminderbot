const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");

/*
 * Load in events from JSON and filter out example
 */
var dateEvents = []
dateEvents = JSON.parse(fs.readFileSync("events.json"));
dateEvents = dateEvents.filter(item => item.title !== 'Example');

if (dateEvents.length == 0) {
  throw "dateEvents cannot be empty";

}

console.log(dateEvents);

// const token = process.env.TOKEN;
// const client = new Client({
//   intents: [
//     GatewayIntentBits.Guilds,
//     GatewayIntentBits.MessageContent,
//   ],
// });
