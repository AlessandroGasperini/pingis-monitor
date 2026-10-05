import { config } from "./config.js";
import { getMonitoringDates } from "./dates.js";
import { fetchFacilityAvailability } from "./matchi.js";
import { sendTelegramMessage } from "./telegram.js";
import { slotKey } from "./state.js";

async function loadState(env) {
  const raw = await env.MONITOR_STATE.get("state");

  if (!raw) {
    return { availableSlots: [] };
  }

  return JSON.parse(raw);
}

async function saveState(env, state) {
  await env.MONITOR_STATE.put(
    "state",
    JSON.stringify(state)
  );
}

async function getNextDates(env, allDates) {
  const rawIndex = await env.MONITOR_STATE.get("rotationIndex");
  const index = Number(rawIndex || 0);

  const dates = [
    allDates[index % allDates.length],
    allDates[(index + 1) % allDates.length],
  ];

  const nextIndex = (index + 2) % allDates.length;

  return {
    dates,
    nextIndex,
  };
}

function getDateFromSlotKey(key) {
  return key.split("|")[1];
}

async function runMonitor(env) {
  const allDates = getMonitoringDates();

  const {
    dates,
    nextIndex,
  } = await getNextDates(env, allDates);

  const previousState = await loadState(env);

  const previousKeys = new Set(
    previousState.availableSlots
  );

  const currentSlots = [];
  const currentKeys = new Set();

  let hadErrors = false;

  console.log(
    `Kontrollerar ${dates.length} datum: ${dates.join(", ")}`
  );

  for (const facility of config.facilities) {
    console.log(
      `=== ${facility.name} (${facility.id}) ===`
    );

    for (const date of dates) {
      try {
        const slots = await fetchFacilityAvailability(
          facility,
          date
        );

        console.log(
          `${date}: ${slots.length} lediga slots`
        );

        for (const slot of slots) {
          const key = slotKey(slot);

          currentSlots.push(slot);
          currentKeys.add(key);

          console.log(
            `  ${slot.time} — ${slot.court} — ${slot.duration}`
          );
        }
      } catch (error) {
        hadErrors = true;

        console.error(
          `${date}: FEL — ${error.message}`
        );
      }
    }
  }

  console.log(
    `Totalt lediga slots: ${currentSlots.length}`
  );

  if (hadErrors) {
    console.error(
      "Minst ett MATCHi-anrop misslyckades. State och rotation sparas inte."
    );

    return;
  }

  const newSlots = currentSlots.filter(
    (slot) => !previousKeys.has(slotKey(slot))
  );

  console.log(
    `Nya slots: ${newSlots.length}`
  );

  if (newSlots.length > 0) {
    const grouped = new Map();

    for (const slot of newSlots) {
      const key = slot.facilityName;

      if (!grouped.has(key)) {
        grouped.set(key, new Map());
      }

      const facilityDates = grouped.get(key);

      if (!facilityDates.has(slot.date)) {
        facilityDates.set(
          slot.date,
          new Set()
        );
      }

      facilityDates
        .get(slot.date)
        .add(slot.time);
    }

    const messageStarters = [
  "🏓 BING BONG boka PING PONG!",
  "🎾 Angelo here! När ska vi lira?",
  "🐂 Open stance with Fernanche!",
  "🐌 Ska vi köra 5an???",
  "🪥 Pablo e sugen!",
];

    const randomStarter =
      messageStarters[
        Math.floor(
          Math.random() * messageStarters.length
        )
      ];

    const lines = [
      randomStarter,
      "",
    ];

    for (const [
      facilityName,
      facilityDates,
    ] of grouped) {
      lines.push(
        `📍 ${facilityName.toUpperCase()}`
      );

      for (const [date, times] of facilityDates) {
        const formattedDate = date
          .split("-")
          .slice(1)
          .join("/");

        const sortedTimes = [...times].sort();

        lines.push(
          `${formattedDate}: ${sortedTimes.join(", ")}`
        );
      }

      lines.push("");
    }

    console.log(
      "Skickar Telegram..."
    );

    await sendTelegramMessage(
      lines.join("\n"),
      env
    );

    console.log(
      "Telegram skickat."
    );
  }

  // Behåll state för datum som INTE kontrollerades denna körning.
  const retainedKeys =
    previousState.availableSlots.filter(
      (key) =>
        !dates.includes(
          getDateFromSlotKey(key)
        )
    );

  // Ersätt state för de datum vi precis kontrollerade.
  const mergedKeys = [
    ...new Set([
      ...retainedKeys,
      ...currentKeys,
    ]),
  ].sort();

  await saveState(env, {
    availableSlots: mergedKeys,
  });

  // Flytta rotationen först när hela körningen lyckats.
  await env.MONITOR_STATE.put(
    "rotationIndex",
    String(nextIndex)
  );

  console.log(
    `State sparad i KV. Nästa rotation index: ${nextIndex}`
  );
}

export default {
  async fetch(request, env) {
    await runMonitor(env);

    return new Response(
      "Monitor körd!"
    );
  },

  async scheduled(event, env, ctx) {
    await runMonitor(env);
  },
};