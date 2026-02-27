import { NowPlayingCarousel } from "@/components/now-playing-carousel";
import { RecommendationsCarousel } from "@/components/recommendations-carousel";
import { SimilarCarousel } from "@/components/similar-carousel";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl animate-in fade-in duration-300 px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Explore</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover what to watch next and keep your critiques flowing
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Now Playing</h2>
        <NowPlayingCarousel />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">Your Next Watch</h2>
        <RecommendationsCarousel />
      </section>

      <section className="mt-12">
        <SimilarCarousel />
      </section>
    </main>
  );
}
