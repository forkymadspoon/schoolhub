const BASE = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN ?? ''}`;

interface TelegramResponse {
  ok: boolean;
  description?: string;
}

export async function sendMessage(chatId: string, text: string): Promise<void> {
  const res = await fetch(`${BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const json = await res.json() as TelegramResponse;
  if (!json.ok) throw new Error(`Telegram error: ${json.description ?? 'unknown'}`);
}

export async function sendPhoto(chatId: string, imageUrl: string, caption: string): Promise<void> {
  const res = await fetch(`${BASE}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, photo: imageUrl, caption }),
  });
  const json = await res.json() as TelegramResponse;
  if (!json.ok) throw new Error(`Telegram error: ${json.description ?? 'unknown'}`);
}
