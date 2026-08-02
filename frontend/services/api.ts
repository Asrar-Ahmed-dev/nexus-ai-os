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
export async function createChat() {
  const response = await fetch(`${API_URL}/chats/`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to create chat");
  }

  return await response.json();
}
export async function getMessages(chat_id: number) {

  const response = await fetch(
    `${API_URL}/chat/${chat_id}/messages`
  );

  if (!response.ok) {
    throw new Error("Failed to load messages");
  }

  return await response.json();

}