# Changelog

All notable changes to Critiqo will be documented in this file.

## v0.2.0 — 2026-02-22

### Added

- Supabase backend with authentication (email/password + OAuth via Google, GitHub, Discord)
- TV show support via TMDB multi-search across movies and TV shows
- Dedicated movie detail pages at `/movie/[id]` with hero backdrop, metadata, and actions
- Dedicated TV show detail pages at `/tv/[id]` with season/episode info
- Now Playing carousel on home page with horizontal scroll and arrow navigation
- Cast and crew display on detail pages (actors with character names; directors, producers, writers, composers, cinematographers)
- Watchlist functionality to bookmark movies and TV shows for later
- "Uninterested" feature to hide items from the home page carousel
- Review system with sentiment labels (Positive, Neutral, Negative), thumbs up/down voting, and filtering/sorting
- Search autocomplete widget with floating dropdown showing top results
- Full search results page at `/search` with pagination
- Open Graph and Twitter Card preview metadata for social sharing
- Dynamic favicon with Critiqo "C" lettermark
- Database migration SQL with full schema, RLS policies, and auto-profile creation trigger

### Changed

- Search results now sorted by popularity (most relevant first)
- Critique store migrated from localStorage to Supabase (with localStorage fallback for unauthenticated users)
- Search no longer replaces home page content; results appear as a dropdown widget
- Scrollbar styled to match the dark cinematic theme
- Changelog format standardized to `vX.Y.Z — YYYY-MM-DD` with Added/Changed/Fixed/Removed sections
- Navbar now shows auth state with sign-in button or user avatar
- Profile page requires authentication and displays the signed-in user's data
- MovieCard component supports both button and link modes with optional media type badge
- Critique interface extended with `mediaType` field for movie/TV discrimination

### Fixed

- `getServerSnapshot` infinite loop in `use-critiques` hook caused by returning a new empty array on every call
- Missing INSERT RLS policy on `profiles` table preventing profile auto-creation for pre-migration users
- Auto-create `profiles` row on login when missing (handles users who signed up before migration was applied)
- Supabase error objects (PostgrestError) now display actual messages instead of `{}` via `getErrorMessage` utility
- React hooks ordering violation in `MediaActions` where `useState` was called after a conditional return

## v0.1.0 — 2026-02-21

### Added

- Initialized Next.js 16 project with TypeScript, Tailwind CSS v4, and App Router
- Integrated shadcn/ui component library (button, input, card, dialog, badge, avatar, separator, tabs, tooltip)
- Configured dark cinematic theme with amber/gold accent colors
- Set up TMDB image domain in `next.config.ts`
- Created TMDB API client (`src/lib/tmdb.ts`) with `searchMovies`, `getMovieDetails`, and `getMovieCredits` functions
- Added image URL helpers for posters and backdrops at various sizes
- Added `.env.example` with placeholder keys (`NEXT_PUBLIC_TMDB_API_KEY`, `NEXT_PUBLIC_TMDB_BASE_URL`, `NEXT_PUBLIC_TMDB_IMAGE_BASE_URL`)
- Defined shared types (`src/lib/types.ts`): `Critique`, `CritiqueRatings`, `CritiqueDimension`, `TMDBMovie`, `TMDBMovieDetails`, `TMDBSearchResponse`, `TMDBCredits`
- Implemented score computation: five dimensions (Story, Acting, Visuals, Directing, Music) rated 1-5 stars, summed and multiplied by 4 for a score out of 100
- Added TMDB genre ID-to-name mapping
- Created `CritiqueStore` interface (`src/lib/critique-store.ts`) with `getAll`, `getByMovieId`, `save`, and `delete` methods
- Implemented `LocalCritiqueStore` backed by `localStorage`, structured for future Supabase swap
- Built reactive `useCritiques` hook (`src/hooks/use-critiques.ts`) using `useSyncExternalStore`
- Navbar (`navbar.tsx`): sticky top nav with Critiqo logo, Search and Profile links with active route highlighting
- StarRating (`star-rating.tsx`): interactive 1-5 star input with hover preview per dimension
- ScoreBadge (`score-badge.tsx`): color-coded score display (green/amber/orange/red based on score range)
- MovieCard (`movie-card.tsx`): poster card with title, year, and optional score overlay
- CritiqueDialog (`critique-dialog.tsx`): modal with movie details, five-dimension star rating, live score preview, save/update/delete actions
- MovieSearch (`movie-search.tsx`): debounced search input (300ms) with TMDB results grid
- Home / Search (`/`): search bar with heading, responsive movie results grid, click-to-critique flow
- Profile (`/profile`): placeholder avatar and username, critique count and average score, dimension average bars, highest/lowest rated movies, top genres, critiqued movies grid with edit-on-click
