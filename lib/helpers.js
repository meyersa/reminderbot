/**
 * Validate Date Entries
 *
 * - Should be valid when parsed with Date()
 * - Should not equal nothing
 *
 * @param {String} dateString to be parsed
 * @returns True if valid, false if not
 */
export function isValidDate(dateString) {
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
 * @returns
 */
export function isValidTitle(title) {
  const trimTitle = title.trim();
  return trimTitle.length > 1 && trimTitle.length < 50 && trimTitle !== "Example";
}
