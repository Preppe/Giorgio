import { Skeleton } from "@/components/ui/skeleton";

export function MessageSkeleton() {
  return (
    <div className="space-y-4 px-4">
      {/* User message skeleton */}
      <div className="flex justify-end">
        <div className="max-w-xs">
          <Skeleton className="h-12 w-48 rounded-lg bg-accent/20" />
        </div>
      </div>
      
      {/* Assistant message skeleton */}
      <div className="px-1">
        <div className="bg-primary/5 border-l-2 border-primary/30 py-4 px-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4 bg-primary/20" />
            <Skeleton className="h-4 w-1/2 bg-primary/20" />
            <Skeleton className="h-4 w-2/3 bg-primary/20" />
          </div>
        </div>
      </div>
      
      {/* Another user message skeleton */}
      <div className="flex justify-end">
        <div className="max-w-xs">
          <Skeleton className="h-8 w-32 rounded-lg bg-accent/20" />
        </div>
      </div>
      
      {/* Another assistant message skeleton */}
      <div className="px-1">
        <div className="bg-primary/5 border-l-2 border-primary/30 py-4 px-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-primary/20" />
            <Skeleton className="h-4 w-4/5 bg-primary/20" />
          </div>
        </div>
      </div>
    </div>
  );
}