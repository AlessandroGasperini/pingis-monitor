const TELEGRAM_API = "https://api.telegram.org";

export async function sendTelegramMessage(message, env) {
  const token = env.TELEGRAM_BOT_TOKEN;

  const chatIds = [
    env.TELEGRAM_CHAT_ID,
    env.TELEGRAM_CHAT_ID_2,
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

    if (!response.ok) {
      const body = await response.text();

      throw new Error(
        `Telegram HTTP ${response.status}: ${body.slice(0, 500)}`
      );
    }
  }
}