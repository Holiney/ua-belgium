import { memo, forwardRef, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ListingCardSkeleton, LoadingMore, EndOfList } from './Skeleton';

// Threshold for virtualization (virtualize if more than this)
const VIRTUALIZATION_THRESHOLD = 30;

/**
 * Optimized list component that:
 * - Uses virtualization for large lists (>30 items)
 * - Falls back to regular list for small lists
 * - Supports infinite scroll with IntersectionObserver
 * - Shows loading states and end-of-list indicators
 */
export const OptimizedList = memo(function OptimizedList({
  items,
  renderItem,
  keyExtractor,
  isLoading,
  isLoadingMore,
  hasMore,
  total,
  onLoadMore,
  emptyMessage = 'Оголошень не знайдено',
  className = '',
}) {
  // Show skeletons while initial loading
  if (isLoading && items.length === 0) {
    return (
      <div className={`grid gap-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (!isLoading && items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  // Use virtualization for large lists
  if (items.length > VIRTUALIZATION_THRESHOLD) {
    return (
      <VirtualizedListInner
        items={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        total={total}
        onLoadMore={onLoadMore}
        className={className}
      />
    );
  }

  // Regular list for small number of items
  return (
    <RegularList
      items={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      total={total}
      onLoadMore={onLoadMore}
      className={className}
    />
  );
});

/**
 * Virtualized list using react-virtuoso
 */
const VirtualizedListInner = memo(function VirtualizedListInner({
  items,
  renderItem,
  keyExtractor,
  isLoadingMore,
  hasMore,
  total,
  onLoadMore,
  className,
}) {
  // Custom list component to add gap styling
  const List = useCallback(
    forwardRef(function ListComponent(props, ref) {
      return <div ref={ref} {...props} className={`grid gap-4 ${className}`} />;
    }),
    [className]
  );

  // Footer component for loading more or end of list
  const Footer = useCallback(() => {
    if (isLoadingMore) return <LoadingMore />;
    if (!hasMore) return <EndOfList total={total} />;
    return null;
  }, [isLoadingMore, hasMore, total]);

  return (
    <Virtuoso
      useWindowScroll
      data={items}
      itemContent={(index, item) => (
        <div key={keyExtractor(item)} className="pb-4">
          {renderItem(item, index)}
        </div>
      )}
      endReached={hasMore && onLoadMore ? onLoadMore : undefined}
      overscan={200}
      components={{
        List,
        Footer,
      }}
    />
  );
});

/**
 * Regular list with IntersectionObserver for infinite scroll
 */
const RegularList = memo(function RegularList({
  items,
  renderItem,
  keyExtractor,
  isLoadingMore,
  hasMore,
  total,
  onLoadMore,
  className,
}) {
  // Intersection observer callback for infinite scroll
  const loadMoreRef = useCallback(
    (node) => {
      if (!node || !hasMore || !onLoadMore) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isLoadingMore) {
            onLoadMore();
          }
        },
        { rootMargin: '200px', threshold: 0.1 }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasMore, isLoadingMore, onLoadMore]
  );

  return (
    <div className={`grid gap-4 ${className}`}>
      {items.map((item, index) => (
        <div key={keyExtractor(item)}>
          {renderItem(item, index)}
        </div>
      ))}

      {/* Load more trigger element */}
      {hasMore && <div ref={loadMoreRef} className="h-1" />}

      {/* Loading more indicator */}
      {isLoadingMore && <LoadingMore />}

      {/* End of list indicator */}
      {!hasMore && !isLoadingMore && <EndOfList total={total} />}
    </div>
  );
});

export default OptimizedList;
