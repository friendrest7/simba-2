import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { SessionUser } from "@/lib/demo-store";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  if (!client) {
    client = createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return client;
}

export function supabaseUserToSessionUser(user: User): SessionUser {
  const metadata = user.user_metadata ?? {};
  const name =
    typeof metadata.name === "string" && metadata.name.trim()
      ? metadata.name.trim()
      : typeof metadata.full_name === "string" && metadata.full_name.trim()
        ? metadata.full_name.trim()
        : user.email?.split("@")[0] || "Simba Customer";

  const phone =
    typeof user.phone === "string" && user.phone.trim()
      ? user.phone
      : typeof metadata.phone === "string"
        ? metadata.phone
        : "";

  return {
    id: user.id,
    name,
    email: user.email || "",
    phone,
    role: "customer",
    branches: [],
  };
}

export async function getSupabaseSessionUser() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user ? supabaseUserToSessionUser(session.user) : null;
}

export function listenToSupabaseAuth(
  onChange: (nextUser: SessionUser | null, session: Session | null) => void,
) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session?.user ? supabaseUserToSessionUser(session.user) : null, session);
  });

  return subscription;
}
