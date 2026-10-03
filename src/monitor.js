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
    const key = slot.facilityName;

    if (!grouped.has(key)) {
      grouped.set(key, new Map());
    }

    const dates = grouped.get(key);

    if (!dates.has(slot.date)) {
      dates.set(slot.date, new Set());
    }

    dates.get(slot.date).add(slot.time);
  }

  const lines = [
    "🏓 Nya tider du kanske är intresserad av!",
    "",
  ];

  for (const [facilityName, facilityDates] of grouped) {
    lines.push(facilityName);

    for (const [date, times] of facilityDates) {
      const formattedDate = date.split("-").slice(1).join("/");

      const sortedTimes = [...times].sort();

      lines.push(
        `${formattedDate}: ${sortedTimes.join(", ")}`
      );
    }

    lines.push("");
  }

  console.log("Försöker skicka Telegram...");

  await sendTelegramMessage(lines.join("\n"));

  console.log("Telegram skickat.");
}

const state = {
  availableSlots: [...currentKeys].sort(),
};

await saveState(state);

console.log("State sparad.");