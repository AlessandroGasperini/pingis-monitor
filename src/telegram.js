const TELEGRAM_API = "https:" + "//api.telegram.org";

export async function sendTelegramMessage(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN saknas");
  }

  if (!chatId) {
    throw new Error("TELEGRAM_CHAT_ID saknas");
  }

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
      `Telegram API error: ${data.description || response.statusText}`
    );
  }

  return data;
}
