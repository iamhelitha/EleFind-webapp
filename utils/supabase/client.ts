import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function getRequiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const createClient = () =>
  createBrowserClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", supabaseKey)
  );
