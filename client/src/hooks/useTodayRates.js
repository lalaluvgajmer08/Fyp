import { useQuery } from '@tanstack/react-query';
import { fetchTodayRates } from '../services/rateService';
import { FALLBACK_RATES } from '../data/fallbackRates';

/**
 * Loads today's metal rates.
 *
 * Uses React Query so the storefront shares one cache with the admin console:
 * publishing a rate invalidates ['rates'] and every mounted board refetches.
 * If the API responds but no rates have been published yet, indicative
 * figures are shown and isLive is false — the UI labels them clearly rather
 * than passing placeholder prices off as real ones.
 */
export default function useTodayRates() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['rates', 'today'],
    queryFn: fetchTodayRates,
    staleTime: 60 * 1000,
    // Rates change through the trading day; pick up an admin update without a reload
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const items = Array.isArray(data) ? data : [];
  const isLive = !isError && items.length > 0;
  const rates = isLive ? items : FALLBACK_RATES;

  const updatedAt = isLive
    ? (items[0]?.effectiveDate ?? items[0]?.updatedAt ?? null)
    : null;

  return { rates, isLive, loading: isLoading, updatedAt };
}
