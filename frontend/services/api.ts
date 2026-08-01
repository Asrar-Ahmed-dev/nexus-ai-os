const API_URL = "http://127.0.0.1:8000";

export async function sendMessage(
  chat_id: number,
  message: string
) {
  const response = await fetch(`${API_URL}/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id,
      message,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return await response.json();
}