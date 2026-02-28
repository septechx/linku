import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export type AuthClient = typeof authClient;
export type Session = typeof authClient.$Infer.Session;
