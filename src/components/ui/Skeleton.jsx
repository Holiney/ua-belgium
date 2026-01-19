import { memo } from 'react';

// Base skeleton component with shimmer animation
export const Skeleton = memo(function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      {...props}
    />
  );
});

// Skeleton for listing cards
export const ListingCardSkeleton = memo(function ListingCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full rounded-none" />

      <div className="p-4 space-y-3">
        {/* Category + title */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-3/4" />

        {/* Price */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        {/* Button */}
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
});

// Multiple skeleton cards
export const ListingSkeletonGrid = memo(function ListingSkeletonGrid({ count = 3 }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
});

// Inline loading indicator for infinite scroll
export const LoadingMore = memo(function LoadingMore() {
  return (
    <div className="py-6 flex justify-center">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Завантаження...</span>
      </div>
    </div>
  );
});

// End of list indicator
export const EndOfList = memo(function EndOfList({ total }) {
  if (total === 0) return null;
  return (
    <div className="py-6 text-center text-gray-400 dark:text-gray-500 text-sm">
      Показано всі {total} оголошень
    </div>
  );
});
