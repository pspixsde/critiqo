"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session, Provider, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getSupabaseClient() {
  try {
    return createClient();
  } catch {
    return null;
  }
}

async function ensureProfile(
  supabase: NonNullable<ReturnType<typeof getSupabaseClient>>,
  user: User
) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    await supabase.from("profiles").upsert({
      id: user.id,
      username:
        user.user_metadata?.username ??
        user.email?.split("@")[0] ??
        "user",
      display_name:
        user.user_metadata?.name ??
        user.user_metadata?.username ??
        user.email?.split("@")[0] ??
        "Critic",
    });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    async function init() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const [{ data: userData, error }, { data: sessionData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ]);
      const currentUser = error ? null : userData.user;
      setSession(sessionData.session);
      setUser(currentUser);
      if (currentUser) await ensureProfile(supabase, currentUser);
      setLoading(false);

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, newSession: Session | null) => {
          setSession(newSession);
          const u = newSession?.user ?? null;
          setUser(u);

          if (event === "SIGNED_OUT") {
            setUser(null);
            setSession(null);
            setLoading(false);
            return;
          }

          if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN" || event === "USER_UPDATED") {
            const { data: refreshed, error: refreshError } = await supabase.auth.getUser();
            if (refreshError) {
              setUser(null);
              setSession(null);
              setLoading(false);
              return;
            }
            setUser(refreshed.user);
            if (refreshed.user) await ensureProfile(supabase, refreshed.user);
          } else if (u) {
            await ensureProfile(supabase, u);
          }

          setLoading(false);
        }
      );
      subscription = authListener.subscription;

      const handleVisibilityChange = async () => {
        if (document.visibilityState !== "visible") return;
        const { data: refreshed, error: refreshError } = await supabase.auth.getUser();
        if (refreshError) {
          setUser(null);
          setSession(null);
          return;
        }
        setUser(refreshed.user);
        const { data: latestSession } = await supabase.auth.getSession();
        setSession(latestSession.session);
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      subscription = {
        unsubscribe: () => {
          authListener.subscription.unsubscribe();
          document.removeEventListener("visibilitychange", handleVisibilityChange);
        },
      };
    }

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, username: string, name: string) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase not configured");
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, name } },
      });
      if (error) throw error;
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase not configured");
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    []
  );

  const signInWithOAuth = useCallback(
    async (provider: Provider) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase not configured");
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    },
    []
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signInWithOAuth, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
