import { MovieSearch } from "@/components/movie-search";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Discover &amp; Critique
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search for a movie and rate it across five dimensions
        </p>
      </div>
      <MovieSearch />
    </main>
  );
}
