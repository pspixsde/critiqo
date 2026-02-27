"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/movie-card";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useUninterested } from "@/hooks/use-uninterested";
import { useCustomLists, type CustomListItem } from "@/hooks/use-custom-lists";
import { useAuth } from "@/components/auth-provider";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

type ListSelection = "watchlist" | "uninterested" | { customListId: string };

export default function ListsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { watchlist } = useWatchlist();
  const { uninterested } = useUninterested();
  const { lists, loading: listsLoading, createList, renameList, deleteList, getListItems } = useCustomLists();
  const [activeList, setActiveList] = useState<ListSelection>("watchlist");
  const [customItems, setCustomItems] = useState<CustomListItem[]>([]);
  const [customLoading, setCustomLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    if (typeof activeList === "string") return;
    let cancelled = false;

    async function loadCustomItems() {
      setCustomLoading(true);
      try {
        const items = await getListItems(activeList.customListId);
        if (!cancelled) setCustomItems(items);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        if (!cancelled) setCustomLoading(false);
      }
    }

    void loadCustomItems();
    return () => {
      cancelled = true;
    };
  }, [activeList, getListItems]);

  const activeCustomList = useMemo(() => {
    if (typeof activeList === "string") return null;
    return lists.find((list) => list.id === activeList.customListId) ?? null;
  }, [activeList, lists]);

  if (loading || !user) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="animate-pulse rounded-lg border border-border/50 p-8" />
      </main>
    );
  }

  async function handleCreateList() {
    const name = window.prompt("Enter list name");
    if (!name) return;
    try {
      await createList(name);
      toast.success("List created");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleRenameList(listId: string, currentName: string) {
    const nextName = window.prompt("Rename list", currentName);
    if (!nextName || nextName === currentName) return;
    try {
      await renameList(listId, nextName);
      toast.success("List renamed");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleDeleteList(listId: string) {
    if (!window.confirm("Delete this list? This cannot be undone.")) return;
    try {
      await deleteList(listId);
      if (typeof activeList !== "string" && activeList.customListId === listId) {
        setActiveList("watchlist");
      }
      toast.success("List deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <main className="mx-auto max-w-5xl animate-in fade-in duration-300 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Lists</h1>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border border-border/50 p-3">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setActiveList("watchlist")}
              className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                activeList === "watchlist" ? "bg-amber-500/15 text-amber-500" : "hover:bg-accent"
              }`}
            >
              Watchlist
            </button>
            <button
              type="button"
              onClick={() => setActiveList("uninterested")}
              className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                activeList === "uninterested" ? "bg-amber-500/15 text-amber-500" : "hover:bg-accent"
              }`}
            >
              Uninterested
            </button>
          </div>
          <div className="my-3 border-t border-border/50" />
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Custom Lists</p>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleCreateList}>
              + New
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            {lists.map((list) => {
              const active =
                typeof activeList !== "string" && activeList.customListId === list.id;
              return (
                <button
                  type="button"
                  key={list.id}
                  onClick={() => setActiveList({ customListId: list.id })}
                  className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    active ? "bg-amber-500/15 text-amber-500" : "hover:bg-accent"
                  }`}
                >
                  <span className="block truncate">{list.name}</span>
                  <span className="text-xs text-muted-foreground">{list.itemCount} titles</span>
                </button>
              );
            })}
            {!listsLoading && lists.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">No custom lists yet</p>
            )}
          </div>
        </aside>

        <section>
          {activeList === "watchlist" && (
            <>
              <h2 className="mb-4 text-lg font-semibold">Watchlist</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {watchlist.map((item) => (
                  <MovieCard
                    key={`${item.mediaType}-${item.mediaId}`}
                    movieId={item.mediaId}
                    title={item.title}
                    posterPath={item.posterPath}
                    releaseYear=""
                    href={`/${item.mediaType}/${item.mediaId}`}
                    mediaType={item.mediaType}
                  />
                ))}
              </div>
            </>
          )}

          {activeList === "uninterested" && (
            <>
              <h2 className="mb-4 text-lg font-semibold">Uninterested</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {uninterested.map((item) => (
                  <MovieCard
                    key={`${item.mediaType}-${item.mediaId}`}
                    movieId={item.mediaId}
                    title={item.title}
                    posterPath={item.posterPath}
                    releaseYear=""
                    href={`/${item.mediaType}/${item.mediaId}`}
                    mediaType={item.mediaType}
                  />
                ))}
              </div>
            </>
          )}

          {typeof activeList !== "string" && (
            <>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-lg font-semibold">{activeCustomList?.name ?? "Custom List"}</h2>
                {activeCustomList && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRenameList(activeCustomList.id, activeCustomList.name)}
                    >
                      Rename
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteList(activeCustomList.id)}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
              {customLoading ? (
                <div className="rounded-lg border border-border/50 p-8 text-sm text-muted-foreground">
                  Loading list...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {customItems.map((item) => (
                    <MovieCard
                      key={`${item.mediaType}-${item.mediaId}`}
                      movieId={item.mediaId}
                      title={item.title}
                      posterPath={item.posterPath}
                      releaseYear=""
                      href={`/${item.mediaType}/${item.mediaId}`}
                      mediaType={item.mediaType}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
