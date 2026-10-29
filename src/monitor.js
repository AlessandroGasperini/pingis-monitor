import { config } from "./config.js";
import { getMonitoringDates } from "./dates.js";
import { fetchFacilityAvailability } from "./matchi.js";
import { sendTelegramMessage } from "./telegram.js";
import { loadState, saveState, slotKey } from "./state.js";

const dates = getMonitoringDates();
const previousState = await loadState();

const previousKeys = new Set(previousState.availableSlots);

const currentSlots = [];
const currentKeys = new Set();

console.log(`Kontrollerar ${dates.length} datum...`);
console.log("");

for (const facility of config.facilities) {
  console.log(`=== ${facility.name} (${facility.id}) ===`);

  for (const date of dates) {
    try {
      const slots = await fetchFacilityAvailability(facility, date);

      console.log(`${date}: ${slots.length} lediga slots`);

      for (const slot of slots) {
        const key = slotKey(slot);

        currentSlots.push(slot);
        currentKeys.add(key);

        console.log(
          `  ${slot.time} — ${slot.court} — ${slot.duration}`
        );
      }
    } catch (error) {
      console.error(`${date}: FEL — ${error.message}`);
      process.exitCode = 1;
    }
  }

  console.log("");
}

const newSlots = currentSlots.filter(
  (slot) => !previousKeys.has(slotKey(slot))
);

console.log(`Totalt lediga slots: ${currentSlots.length}`);
console.log(`Nya slots: ${newSlots.length}`);


if (newSlots.length > 0) {
  const grouped = new Map();

  for (const slot of newSlots) {
    const facility = config.facilities.find(
      (item) => item.id === slot.facilityId
    );

    const facilityName =
      facility?.nickname ?? slot.facilityName;

    if (!grouped.has(facilityName)) {
      grouped.set(facilityName, new Map());
    }

    const facilityDates = grouped.get(facilityName);

    if (!facilityDates.has(slot.date)) {
      facilityDates.set(slot.date, new Map());
    }

    const dateTimes = facilityDates.get(slot.date);

   // Visa varje klockslag en gång, utan länkar.
if (!dateTimes.has(slot.time)) {
  dateTimes.set(slot.time, true);
}
  }

  const messageStarters = [
    "🐂 Open stance with Fernanche!",
    "🎾 Yo Angelo här! När lirar vi?",
    "🏓 Skippa gym kom pingis!",
    "🐌 5an ikväll?",
    "🪥 Pablo vill lira?",
    "🎤 Call me EMINEM... but don't call me EMINEM!"
  ];

  const randomStarter =
    messageStarters[
      Math.floor(Math.random() * messageStarters.length)
    ];

  const weekdayFormatter = new Intl.DateTimeFormat("sv-SE", {
    weekday: "long",
    timeZone: "UTC",
  });

  const lines = [randomStarter, ""];

  for (const [facilityName, facilityDates] of grouped) {
lines.push(`📍 ${facilityName.toUpperCase()}`);
    const sortedDates = [...facilityDates.entries()].sort(
      ([dateA], [dateB]) => dateA.localeCompare(dateB)
    );

    for (const [date, dateTimes] of sortedDates) {
      const dateObject = new Date(`${date}T12:00:00Z`);

      const weekday = weekdayFormatter
        .format(dateObject);

      const [year, month, day] = date.split("-");

      const formattedDate = `${day}/${month}`;

      const sortedTimes = [...dateTimes.entries()].sort(
        ([timeA], [timeB]) => timeA.localeCompare(timeB)
      );

      const times = sortedTimes.map(([time]) => time);

      const capitalizedWeekday =
        weekday.charAt(0).toUpperCase() + weekday.slice(1);

      lines.push(
        `${capitalizedWeekday} (${formattedDate}): ${times.join(", ")}`
      );
    }

    lines.push("");
  }

  console.log("Skickar Telegram...");

  await sendTelegramMessage(lines.join("\n"), env);

  console.log("Telegram skickat.");
}


const state = {
  availableSlots: [...currentKeys].sort(),
};

await saveState(state);

console.log("State sparad.");