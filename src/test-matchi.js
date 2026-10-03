import { fetchFacilityAvailability } from "./matchi.js";
import { config } from "./config.js";

const facility = config.facilities[0];

const date = "2026-10-06";

try {
  const slots = await fetchFacilityAvailability(facility, date);

  console.log(`\n${facility.name} — ${date}\n`);

  if (slots.length === 0) {
    console.log("Inga lediga tider mellan 18:00 och 20:00.");
  } else {
    for (const slot of slots) {
      console.log(
        `${slot.time} — ${slot.court} — ${slot.duration} — ${slot.slotId}`
      );
    }
  }

  console.log(`\nTotalt: ${slots.length} lediga slots\n`);
} catch (error) {
  console.error("MATCHi test failed:");
  console.error(error);
  process.exitCode = 1;
}
