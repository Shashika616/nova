import { api } from "./client";

export const registerUser = async (email: string, password: string) => {
  return api.post("/auth/register", { email, password });
};

export const loginUser = async (email: string, password: string) => {
  return api.post("/auth/login", { email, password });
};