import { api } from "./client";

export const generateKnowledge = async (
  topic: string,
  level: string,
  token: string
) => {
  return api.post(
    "/knowledge/generate",
    { topic, level },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const streamKnowledge = (topic: string, level: string, token: string) => {
  return fetch(`${import.meta.env.VITE_API_BASE_URL}/knowledge/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topic, level }),
  });
};