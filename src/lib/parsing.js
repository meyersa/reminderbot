import fs from "fs";
import path from "path";
import { Event } from "../types";
import { isValidDate, isValidTitle } from "./helpers";

// Fallback
const EVENTS_FILE = process.env.EVENTS_FILE || "events.json";

/**
 * Parse raw JSON events from file
 * @param {string} [fileName] Optional override for file name
 * @returns {Array} Raw parsed events array
 */
export function parseEvents(fileName) {
  const filePath = path.resolve(fileName || EVENTS_FILE);
  console.log(`Reading events from: ${filePath}`);
  const rawData = fs.readFileSync(filePath, "utf-8");
  const json = JSON.parse(rawData);
  return json.filter((item) => isValidTitle(item.name) && isValidDate(item.date));
}

/**
 * Convert raw events to Event objects
 * @param {Array} rawEvents
 * @returns {Event[]} Array of Event objects
 */
export function toAnniversaries(rawEvents) {
  return rawEvents.map(
    (event) =>
      new Event(
        new Date(event.date),
        event.name,
        event.description || "",
        event.channelId || 0,
        event.peopleToNotify || [],
        event.exact !== false,
        event.notification !== false
      )
  );
}