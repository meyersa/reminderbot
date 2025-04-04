import pino from "pino";
const logger = pino();

/**
 * Function to get the number of days until another
 * @param {Date|string|number} date - date to compare against
 * @param {Date|string|number} now - current date
 * @returns {number}
 */
export function daysUntil(date, now) {
  logger.debug('Calculating days until target date');

  const date1 = new Date(now);
  const date2 = new Date(date);

  return Math.round(
    (Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()) -
      Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())) /
      (1000 * 60 * 60 * 24)
  );
}

/**
 * Get the time difference information for a date
 * @param {Date} date - date to compare against
 * @param {Date} [now=new Date()] - current date
 * @returns {Object}
 */
function getTimeDiff(date, now = new Date()) {
  logger.debug('Getting time difference');

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

  // Rollovers
  if (seconds < 0) {
    seconds += 60;
    minutes--;
  }
  if (minutes < 0) {
    minutes += 60;
    hours--;
  }
  if (hours < 0) {
    hours += 24;
    days--;
  }
  if (days < 0) {
    const prevMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
    days += prevMonth.getUTCDate();
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }

  // Totals
  const minutesTotal = Math.floor(totalSeconds / 60);
  const hoursTotal = Math.floor(totalSeconds / (60 * 60));
  const daysTotal = Math.floor(totalSeconds / (60 * 60 * 24));
  const monthsTotal = years * 12 + months;

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    monthsTotal,
    daysTotal,
    hoursTotal,
    minutesTotal,
    secondsTotal: totalSeconds,
  };
}

/**
 * Get upcoming milestones for a date
 * @param {Date|string|number} date - date to compare against
 * @param {Date|string|number} [now=new Date()] - current date
 * @returns {Object}
 */
export function getUpcoming(date, now = new Date()) {
  logger.debug('Getting upcoming milestones');

  const dateInput = new Date(date);
  const timeDiff = getTimeDiff(date, now);

  const numWeeks = Math.floor(timeDiff.daysTotal / 7) + 1;
  const nextWeek = new Date(dateInput);
  nextWeek.setUTCDate(date.getUTCDate() + 7 * numWeeks);
  const weeksDiff = daysUntil(nextWeek, now);

  const numMonths = timeDiff.monthsTotal + 1;
  const nextMonth = new Date(dateInput);
  nextMonth.setUTCMonth(dateInput.getUTCMonth() + numMonths);
  const monthsDiff = daysUntil(nextMonth, now);

  const numYears = timeDiff.years + 1;
  const nextYear = new Date(dateInput);
  nextYear.setUTCFullYear(dateInput.getUTCFullYear() + numYears);
  const yearsDiff = daysUntil(nextYear, now);

  return {
    weeks: { value: numWeeks, in: weeksDiff },
    months: { value: numMonths, in: monthsDiff },
    years: { value: numYears, in: yearsDiff },
  };
}

/**
 * Get the largest upcoming milestone
 * @param {Date|string|number} date - date to compare against
 * @param {Date|string|number} [now=new Date()] - current date
 * @returns {Object}
 */
export function getLargestUpcoming(date, now = new Date()) {
  logger.debug('Getting largest upcoming milestone');

  const upcomingIn = getUpcoming(date, now);

  if (upcomingIn.months.value > 1) {
    return {
      type: "Years",
      value: upcomingIn.years.value,
      in: upcomingIn.years.in,
    };
  } else if (upcomingIn.weeks.value > 1) {
    return {
      type: "Months",
      value: upcomingIn.months.value,
      in: upcomingIn.months.in,
    };
  } else {
    return {
      type: "Weeks",
      value: upcomingIn.weeks.value,
      in: upcomingIn.weeks.in,
    };
  }
}

/**
 * Get Exact States of a date
 * @param {Date|string|number} date - date to compare against
 * @param {Date|string|number} [now=new Date()] - current date
 * @returns {Object}
 */
export function getExact(date, now = new Date()) {
  logger.debug('Getting exact breakdown');

  const { years, months, days, hours, minutes, seconds } = getTimeDiff(date, now);
  return { years, months, days, hours, minutes, seconds };
}

/**
 * Get Stats of a Date
 * @param {Date|string|number} date - date to compare against
 * @param {Date|string|number} [now=new Date()] - current date
 * @returns {Object}
 */
export function getStats(date, now = new Date()) {
  logger.debug('Getting stats');

  const { years, monthsTotal, daysTotal, hoursTotal, minutesTotal, secondsTotal } = getTimeDiff(date, now);
  return {
    years,
    months: monthsTotal,
    days: daysTotal,
    hours: hoursTotal,
    minutes: minutesTotal,
    seconds: secondsTotal,
  };
}
