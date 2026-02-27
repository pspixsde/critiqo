"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

type AccountTab = "edit-profile" | "settings";

interface ProfileState {
  displayName: string;
  username: string;
  avatarUrl: string;
  isPrivate: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const initialTab = searchParams.get("tab") === "settings" ? "settings" : "edit-profile";
  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);
  const [profile, setProfile] = useState<ProfileState>({
    displayName: "",
    username: "",
    avatarUrl: "",
    isPrivate: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setActiveTab(searchParams.get("tab") === "settings" ? "settings" : "edit-profile");
  }, [searchParams]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth");
      return;
    }
    let cancelled = false;

    async function loadProfile() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, username, avatar_url, is_private")
        .eq("id", user.id)
        .maybeSingle();
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!cancelled && data) {
        setProfile({
          displayName: (data.display_name as string | null) ?? user.user_metadata?.name ?? "",
          username: (data.username as string | null) ?? user.user_metadata?.username ?? "",
          avatarUrl: (data.avatar_url as string | null) ?? user.user_metadata?.avatar_url ?? "",
          isPrivate: Boolean(data.is_private),
        });
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [loading, user, router]);

  const fallbackInitial = useMemo(
    () => profile.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U",
    [profile.displayName, user]
  );

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    const updates = {
      display_name: profile.displayName.trim(),
      avatar_url: profile.avatarUrl.trim() || null,
      is_private: profile.isPrivate,
    };
    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        name: profile.displayName.trim(),
        avatar_url: profile.avatarUrl.trim() || null,
      },
    });
    if (authError) {
      toast.error(authError.message);
    } else {
      toast.success("Changes saved");
    }
    setSaving(false);
  }

  async function togglePrivate() {
    if (!user) return;
    try {
      const next = !profile.isPrivate;
      setProfile((prev) => ({ ...prev, isPrivate: next }));
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({ is_private: next }).eq("id", user.id);
      if (error) throw error;
      toast.success(next ? "Account is now private" : "Account is now public");
    } catch (error) {
      setProfile((prev) => ({ ...prev, isPrivate: !prev.isPrivate }));
      toast.error(getErrorMessage(error));
    }
  }

  if (loading || !user) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="animate-pulse rounded-lg border border-border/50 p-8" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl animate-in fade-in duration-300 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Account</h1>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border border-border/50 p-3">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                activeTab === "edit-profile" ? "bg-amber-500/15 text-amber-500" : "hover:bg-accent"
              }`}
              onClick={() => setActiveTab("edit-profile")}
            >
              Edit Profile
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                activeTab === "settings" ? "bg-amber-500/15 text-amber-500" : "hover:bg-accent"
              }`}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </button>
          </div>
        </aside>

        <section className="rounded-lg border border-border/50 p-4">
          {activeTab === "edit-profile" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Edit Profile</h2>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile.avatarUrl || undefined} alt={profile.displayName || "User"} />
                  <AvatarFallback className="bg-amber-500/15 text-amber-500 text-xl font-bold">
                    {fallbackInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs text-muted-foreground">Profile picture URL</p>
                  <Input
                    value={profile.avatarUrl}
                    onChange={(e) => setProfile((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs text-muted-foreground">Visible name</p>
                <Input
                  value={profile.displayName}
                  onChange={(e) => setProfile((prev) => ({ ...prev, displayName: e.target.value }))}
                />
              </div>

              <div>
                <p className="mb-1 text-xs text-muted-foreground">Username</p>
                <Input value={profile.username} disabled />
                <p className="mt-1 text-xs text-muted-foreground">Username changes coming soon.</p>
              </div>

              <div>
                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Settings</h2>
              <div className="flex items-center justify-between rounded-md border border-border/50 p-3">
                <div>
                  <p className="text-sm font-medium">Make account private</p>
                  <p className="text-xs text-muted-foreground">
                    When private, other users do not see your stats.
                  </p>
                </div>
                <Button variant={profile.isPrivate ? "default" : "outline"} onClick={togglePrivate}>
                  {profile.isPrivate ? "Private" : "Public"}
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
