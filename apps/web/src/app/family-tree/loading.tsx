import {
  PageHeaderSkeleton,
  GridSkeleton,
} from "@/components/ui/skeleton-cards";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <PageHeaderSkeleton />
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <GridSkeleton count={4} columns={4} />
      </div>
    </div>
  );
}
