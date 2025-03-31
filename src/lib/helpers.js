import pino from "pino";
const logger = pino();

/**
 * Validate Date Entries
 * - Should be valid when parsed with Date()
 * - Should not equal nothing
 *
 * @param {String} dateString to be parsed
 * @returns {boolean} True if valid, false if not
 */
export function isValidDate(dateString) {
  logger.debug("Validating date string");
  const date = new Date(dateString);
  return !isNaN(date) && String(dateString).trim() !== "";
}

/**
 * Function to Validate Title
 * - Should be less than 50 char
 * - Should be more than 1 char
 * - Should not be "Example"
 *
 * @param {String} title to verify
 * @returns {boolean}
 */
export function isValidTitle(title) {
  logger.debug("Validating title");
  const trimTitle = title.trim();
  return trimTitle.length > 1 && trimTitle.length < 50 && trimTitle !== "Example";
}

/**
 * Function to get an embed color depending on date
 *
 * @param {Number} largestUpcoming date in days
 * @returns {number} Embed color or NaN if invalid
 */
export function getEmbedColor(largestUpcoming) {
  logger.debug("Getting embed color based on upcoming days");

  if (typeof largestUpcoming != "number" || largestUpcoming < 0) {
    return NaN;
  }
  if (largestUpcoming < 5) return 0xff0000; // Red for <5 days
  if (largestUpcoming <= 10) return 0xffff00; // Yellow for 5-10 days
  return 0x00ff00; // Green for >10 days
}
