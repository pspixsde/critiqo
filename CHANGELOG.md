# Changelog

All notable changes to Critiqo will be documented in this file.

## [v0.1.0] - 2026-02-21

### Project Foundation

- Initialized Next.js 16 project with TypeScript, Tailwind CSS v4, and App Router
- Integrated shadcn/ui component library (button, input, card, dialog, badge, avatar, separator, tabs, tooltip)
- Configured dark cinematic theme with amber/gold accent colors
- Set up TMDB image domain in `next.config.ts`

### TMDB Integration

- Created TMDB API client (`src/lib/tmdb.ts`) with `searchMovies`, `getMovieDetails`, and `getMovieCredits` functions
- Added image URL helpers for posters and backdrops at various sizes
- Added `.env.example` with placeholder keys (`NEXT_PUBLIC_TMDB_API_KEY`, `NEXT_PUBLIC_TMDB_BASE_URL`, `NEXT_PUBLIC_TMDB_IMAGE_BASE_URL`)

### Core Types & Utilities

- Defined shared types (`src/lib/types.ts`): `Critique`, `CritiqueRatings`, `CritiqueDimension`, `TMDBMovie`, `TMDBMovieDetails`, `TMDBSearchResponse`, `TMDBCredits`
- Implemented score computation: five dimensions (Story, Acting, Visuals, Directing, Music) rated 1-5 stars, summed and multiplied by 4 for a score out of 100
- Added TMDB genre ID-to-name mapping

### Data Layer

- Created `CritiqueStore` interface (`src/lib/critique-store.ts`) with `getAll`, `getByMovieId`, `save`, and `delete` methods
- Implemented `LocalCritiqueStore` backed by `localStorage`, structured for future Supabase swap
- Built reactive `useCritiques` hook (`src/hooks/use-critiques.ts`) using `useSyncExternalStore`

### Components

- **Navbar** (`navbar.tsx`): sticky top nav with Critiqo logo, Search and Profile links with active route highlighting
- **StarRating** (`star-rating.tsx`): interactive 1-5 star input with hover preview per dimension
- **ScoreBadge** (`score-badge.tsx`): color-coded score display (green/amber/orange/red based on score range)
- **MovieCard** (`movie-card.tsx`): poster card with title, year, and optional score overlay
- **CritiqueDialog** (`critique-dialog.tsx`): modal with movie details, five-dimension star rating, live score preview, save/update/delete actions
- **MovieSearch** (`movie-search.tsx`): debounced search input (300ms) with TMDB results grid

### Pages

- **Home / Search** (`/`): search bar with heading, responsive movie results grid, click-to-critique flow
- **Profile** (`/profile`): placeholder avatar and username, critique count and average score, dimension average bars, highest/lowest rated movies, top genres, critiqued movies grid with edit-on-click
