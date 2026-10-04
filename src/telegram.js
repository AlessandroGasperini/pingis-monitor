const TELEGRAM_API = "https:" + "//api.telegram.org";

export async function sendTelegramMessage(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  const chatIds = [
    process.env.TELEGRAM_CHAT_ID,
    process.env.TELEGRAM_CHAT_ID_2,
  ].filter(Boolean);

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN saknas");
  }

  if (chatIds.length === 0) {
    throw new Error("Inga Telegram chat IDs konfigurerade");
  }

  for (const chatId of chatIds) {
    const response = await fetch(
      `${TELEGRAM_API}/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(
        `Telegram API error för chat ${chatId}: ${
          data.description || response.statusText
        }`
      );
    }
  }
}