/**
 * Get Exact Stats for a Date
 * @param {*} event 
 */
function getTimeDiff(date, now = new Date()) {
  if (date > now) [date, now] = [now, date];

  // Total diff in seconds
  let totalSeconds = Math.floor((now - date) / 1000);

  // Calendar breakdown (UTC-safe)
  let years = now.getUTCFullYear() - date.getUTCFullYear();
  let months = now.getUTCMonth() - date.getUTCMonth();
  let days = now.getUTCDate() - date.getUTCDate();
  let hours = now.getUTCHours() - date.getUTCHours();
  let minutes = now.getUTCMinutes() - date.getUTCMinutes();
  let seconds = now.getUTCSeconds() - date.getUTCSeconds();

  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
      const prevMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
      days += prevMonth.getUTCDate();
      months--;
  }
  if (months < 0) { months += 12; years--; }

  // Totals
  const minutesTotal = Math.floor(totalSeconds / 60);
  const hoursTotal = Math.floor(totalSeconds / (60 * 60));
  const daysTotal = Math.floor(totalSeconds / (60 * 60 * 24));

  return { years, months, days, hours, minutes, seconds, daysTotal, hoursTotal, minutesTotal, secondsTotal: totalSeconds };
}

export function getExact(date, now = new Date()) {
  const { years, months, days, hours, minutes, seconds } = getTimeDiff(date, now);
  return { years, months, days, hours, minutes, seconds };
}

export function getStats(date, now = new Date()) {
  const { years, months, daysTotal, hoursTotal, minutesTotal, secondsTotal } = getTimeDiff(date, now);
  return { years, months, days: daysTotal, hours: hoursTotal, minutes: minutesTotal, seconds: secondsTotal };
}