import { SearchWidget } from "@/components/search-widget";
import { NowPlayingCarousel } from "@/components/now-playing-carousel";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Discover &amp; Critique
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search for movies &amp; TV shows and rate them across five dimensions
        </p>
      </div>

      <SearchWidget />

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">Now Playing</h2>
        <NowPlayingCarousel />
      </section>
    </main>
  );
}
