import { apiFetch } from "../lib/api";
import { getToken } from "../lib/auth";

const API_URL = "http://127.0.0.1:8000";

export async function sendMessage(
  chat_id: number,
  message: string
) {
  return await apiFetch("/chat/", {
    method: "POST",
    body: JSON.stringify({
      chat_id,
      message,
    }),
  });
}

export async function createChat() {
  return apiFetch("/chats/", {
    method: "POST",
  });
}

export async function getMessages(chat_id: number) {
  return apiFetch(`/chat/${chat_id}/messages`);
}

export async function renameChat(
  chat_id: number,
  title: string
) {
  return apiFetch(`/chats/${chat_id}/title`, {
    method: "PUT",
    body: JSON.stringify({
      title,
    }),
  });
}

export async function getChats() {
  return apiFetch("/chats/");
}

export async function deleteChat(
  chat_id: number
) {
  return apiFetch(`/chats/${chat_id}`, {
    method: "DELETE",
  });
}

export async function streamMessage(
  chatId: number,
  message: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  filename?: string
) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/chat/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify({
        chat_id: chatId,
        message,
        filename: filename || null,
      }),
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const text = decoder.decode(value);
    onChunk(text);
  }
}

export async function uploadFile(file: File) {
  const token = getToken();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/files/upload`,
    {
      method: "POST",
      headers: {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
}