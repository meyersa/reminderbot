export function calculateAnniversaryInfo(eventDate) {
  const now = new Date();
  const event = new Date(eventDate);
  const {
    seconds,
    minutes,
    hours,
    days,
    weeks,
    years,
    months,
    remainingMonths,
    remainingDays,
    remainingHours,
    remainingMinutes,
    remainingSeconds,
  } = calculateTimeDifferences(now, event);

  const upcoming = calculateUpcomingMilestones(days, years, months, weeks);
  const largestUpcoming = selectLargestUpcoming(upcoming, days);
  const exact = formatExactBreakdown(
    years,
    remainingMonths,
    remainingDays,
    remainingHours,
    remainingMinutes,
    remainingSeconds
  );
  const stats = formatStats(years, months, days, hours, minutes, seconds);

  return { upcoming, largestUpcoming, stats, exact };
}

function calculateTimeDifferences(now, event) {
  const diffTime = now - event;
  const seconds = Math.floor(diffTime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const years = Math.floor(days / 365);
  const months = Math.floor(days / 30.44); // Approximate months

  const overflowDays = days % 365;
  const remainingMonths = Math.floor(overflowDays / 30.44);
  const remainingDays = Math.floor(overflowDays % 30.44);
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  return {
    seconds,
    minutes,
    hours,
    days,
    weeks,
    years,
    months,
    remainingMonths,
    remainingDays,
    remainingHours,
    remainingMinutes,
    remainingSeconds,
  };
}

function calculateUpcomingMilestones(days, years, months, weeks) {
  const daysToNextYear = 365 - (days % 365);
  const daysToNextMonth = 30 - (days % 30);
  const daysToNextWeek = 7 - (days % 7);

  const upcoming = [];
  upcoming.push({ label: `${years + 1} Year${years > 0 ? "s" : ""}`, days: daysToNextYear });
  upcoming.push({ label: `${months + 1} Month${months > 0 ? "s" : ""}`, days: daysToNextMonth });
  upcoming.push({ label: `${weeks + 1} Week${weeks > 0 ? "s" : ""}`, days: daysToNextWeek });

  upcoming.sort((a, b) => a.days - b.days);
  return upcoming;
}

function selectLargestUpcoming(upcoming, days) {
  let largestUpcoming;
  if (days < 365) {
    if (days < 30) {
      largestUpcoming =
        upcoming.find((event) => event.label.includes("Week") && event.days > 0) || upcoming[0];
    } else {
      largestUpcoming =
        upcoming.find((event) => event.label.includes("Month") && event.days > 0) || upcoming[0];
    }
  } else {
    largestUpcoming =
      upcoming.find((event) => event.label.includes("Year") && event.days > 0) || upcoming[0];
  }
  return largestUpcoming;
}

function formatExactBreakdown(
  years,
  remainingMonths,
  remainingDays,
  remainingHours,
  remainingMinutes,
  remainingSeconds
) {
  return [
    `\`${years}\` Years, \`${remainingMonths}\` Months, \`${remainingDays}\` Days, \`${remainingHours}\` Hours, \`${remainingMinutes}\` Minutes, \`${remainingSeconds}\` Seconds`,
  ];
}

function formatStats(years, months, days, hours, minutes, seconds) {
  return [
    `\`${years}\` Years`,
    `\`${months}\` Months`,
    `\`${days}\` Days`,
    `\`${hours}\` Hours`,
    `\`${minutes}\` Minutes`,
    `\`${seconds}\` Seconds`,
  ];
}
