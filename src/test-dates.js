import { getMonitoringDates } from "./dates.js";

const dates = getMonitoringDates();

console.log(`Antal datum: ${dates.length}`);
console.log(dates.join("\n"));
