import * as cheerio from "cheerio";
import { config } from "./config.js";

const MATCHI_URL = "https://www.matchi.se/book/findFacilities";

export async function fetchFacilityAvailability(facility, date) {
  const body = new URLSearchParams({
    lat: config.search.lat,
    lng: config.search.lng,
    offset: String(config.search.offset),
    outdoors: config.search.outdoors,
    sport: String(config.sport),
    date,
    q: facility.name,
    hasCamera: config.search.hasCamera,
  });

  const response = await fetch(MATCHI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "text/html, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
    },
    body,
  });

if (!response.ok) {
  const errorBody = await response.text();

  throw new Error(
    `MATCHi HTTP ${response.status} ${response.statusText}: ${errorBody.slice(0, 500)}`
  );
}

  const html = await response.text();
  const $ = cheerio.load(html);

  const slots = [];

  $(`div[id^="${facility.id}_"]`).each((_, element) => {
    const panel = $(element);

    const panelId = panel.attr("id");
    const timestamp = Number(panelId.split("_")[1]);

    if (!Number.isFinite(timestamp)) {
      return;
    }

    const time = new Intl.DateTimeFormat("sv-SE", {
      timeZone: config.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(timestamp));

    const [hour] = time.split(":").map(Number);

    if (
      hour < config.monitoring.startHour ||
      hour > config.monitoring.endHour
    ) {
      return;
    }

    panel.find("tr").each((_, row) => {
      const cells = $(row).find("td");

      if (cells.length < 4) {
        return;
      }

      const court = $(cells[0]).text().trim().replace(/\s+/g, " ");
      const duration = $(cells[1]).text().trim();
      const sport = $(cells[2]).find("div").first().text().trim();

      const bookingLink = $(cells[3])
        .find("a[href*='slotIds']")
        .first();

      const href = bookingLink.attr("href") || "";

      if (!href) {
        return;
      }

      const url = new URL(href, "https://www.matchi.se");
      const returnUrl = url.searchParams.get("returnUrl");

      if (!returnUrl) {
        return;
      }

      const bookingUrl = new URL(returnUrl, "https://www.matchi.se");
      const slotId = bookingUrl.searchParams.get("slotIds");

      if (!slotId) {
        return;
      }

      slots.push({
        facilityId: facility.id,
        facilityName: facility.name,
        date,
        time,
        court,
        duration,
        sport,
        slotId,
      });
    });
  });

  return slots;
}
