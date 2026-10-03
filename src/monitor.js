import { config } from "./config.js";
import { getMonitoringDates } from "./dates.js";
import { fetchFacilityAvailability } from "./matchi.js";
import { loadState, saveState, slotKey } from "./state.js";

const dates = getMonitoringDates();
const previousState = await loadState();

const previousKeys = new Set(previousState.availableSlots);

const currentSlots = [];
const currentKeys = new Set();
let hadErrors = false;

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
    }
  }

  console.log("");
}

const newSlots = currentSlots.filter(
  (slot) => !previousKeys.has(slotKey(slot))
);

const state = {
  availableSlots: [...currentKeys].sort(),
};

await saveState(state);

console.log(`Totalt lediga slots: ${currentSlots.length}`);
console.log(`Nya slots: ${newSlots.length}`);

for (const slot of newSlots) {
  console.log(
    `NY: ${slot.date} ${slot.time} — ${slot.court} — ${slot.duration}`
  );
}
