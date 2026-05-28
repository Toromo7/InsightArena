export const CACHE_WARMING_KEYS = {
  activeEvents: 'cache-warming:active-events',
  trendingEvents: 'cache-warming:trending-events',
  platformStatistics: 'cache-warming:platform-statistics',
  popularEventDetail: (eventId: string) =>
    `cache-warming:popular-event:${eventId}`,
} as const;
