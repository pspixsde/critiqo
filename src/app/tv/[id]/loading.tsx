import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="mt-6 h-10 w-1/2" />
      <Skeleton className="mt-4 h-28 w-full" />
    </main>
  );
}
