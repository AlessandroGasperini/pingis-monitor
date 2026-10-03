import { mkdir, readFile, writeFile } from "node:fs/promises";

const STATE_DIR = "data";
const STATE_FILE = "data/state.json";

async function ensureStateDir() {
  await mkdir(STATE_DIR, { recursive: true });
}

export async function loadState() {
  try {
    const content = await readFile(STATE_FILE, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        availableSlots: [],
      };
    }

    throw error;
  }
}

export async function saveState(state) {
  await ensureStateDir();

  await writeFile(
    STATE_FILE,
    `${JSON.stringify(state, null, 2)}\n`,
    "utf8"
  );
}

export function slotKey(slot) {
  return [
    slot.facilityId,
    slot.date,
    slot.time,
    slot.court,
    slot.duration,
  ].join("|");
}
