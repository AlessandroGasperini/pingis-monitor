import { config } from "./config.js";

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

export function getMonitoringDates() {
  const dates = [];
  const today = new Date();

  today.setUTCHours(12, 0, 0, 0);

  for (let offset = 0; offset <= config.monitoring.daysAhead; offset++) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + offset);

    const weekday = date.getUTCDay();

    if (config.monitoring.weekdays.includes(weekday)) {
      dates.push(formatDate(date));
    }
  }

  return dates;
}
