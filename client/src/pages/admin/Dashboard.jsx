import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, StatCard } from '../../components/common/Card';
import Badge, { STATUS_TONE } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Skeleton } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { fetchNews } from '../../services/newsService';
import useTodayRates from '../../hooks/useTodayRates';
import { formatNPR, formatPercent, formatLongDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { rates, isLive, loading: ratesLoading } = useTodayRates();

  // Three separate counts — cheap because the API returns meta.total
  const published = useQuery({
    queryKey: ['news', { status: 'published', limit: 1 }],
    queryFn: () => fetchNews({ status: 'published', limit: 1 }),
  });
  const drafts = useQuery({
    queryKey: ['news', { status: 'draft', limit: 1 }],
    queryFn: () => fetchNews({ status: 'draft', limit: 1 }),
  });
  const recent = useQuery({
    queryKey: ['news', { limit: 5, dashboard: true }],
    queryFn: () => fetchNews({ limit: 5 }),
  });

  const stats = [
    {
      label: 'Published articles',
      value: published.isLoading ? '—' : (published.data?.meta?.total ?? 0),
      delta: 'Visible on the storefront',
    },
    {
      label: 'Drafts',
      value: drafts.isLoading ? '—' : (drafts.data?.meta?.total ?? 0),
      delta: 'Not yet published',
    },
    {
      label: 'Fine gold / tola',
      value: ratesLoading ? '—' : formatNPR(rates[0]?.ratePerTola),
      delta: isLive ? 'Live rate' : 'Indicative — rate service pending',
    },
    {
      label: "Today's movement",
      value: ratesLoading ? '—' : formatPercent(rates[0]?.changePercent),
      delta: formatLongDate(new Date()),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-[1.75rem] font-light text-cream-50">
          Good to see you, {user?.name?.split(' ')[0]}
        </h2>
        <p className="mt-1.5 text-sm text-muted-400">
          A summary of store content and today&apos;s metal rates.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent articles */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Recent articles"
            subtitle="Latest content across all statuses"
            action={
              <Button to="/admin/news" variant="outline" size="sm">
                Manage all
              </Button>
            }
          />

          <CardBody className="p-0">
            {recent.isLoading && (
              <div className="space-y-px">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="px-6 py-4">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="mt-2 h-3 w-1/4" />
                  </div>
                ))}
              </div>
            )}

            {recent.isError && (
              <EmptyState
                tone="error"
                title="Could not load articles"
                description={recent.error?.message}
              />
            )}

            {recent.isSuccess && recent.data.items.length === 0 && (
              <EmptyState
                title="No articles yet"
                description="Publish your first market update so customers see it on the storefront."
                action={{ label: 'Write an article', to: '/admin/news/new' }}
              />
            )}

            {recent.isSuccess &&
              recent.data.items.map((article) => (
                <div
                  key={article._id}
                  className="flex items-start justify-between gap-4 border-b border-cream-200/8 px-6 py-4 last:border-0"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/admin/news/${article._id}/edit`}
                      className="block truncate text-cream-50 transition-colors hover:text-gold-400"
                    >
                      {article.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-400">
                      {article.category?.replace(/_/g, ' ')}
                      {article.publishedAt &&
                        ` · ${new Date(article.publishedAt).toLocaleDateString()}`}
                    </p>
                  </div>

                  <Badge tone={STATUS_TONE[article.status]}>{article.status}</Badge>
                </div>
              ))}
          </CardBody>
        </Card>

        {/* Rate summary */}
        <Card>
          <CardHeader title="Metal rates" subtitle={isLive ? 'Live' : 'Indicative figures'} />
          <CardBody className="space-y-4">
            {ratesLoading
              ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-12" />)
              : rates.map((rate) => (
                  <div
                    key={rate._id ?? rate.category}
                    className="flex items-center justify-between gap-4 border-b border-cream-200/8 pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm text-cream-50">{rate.label}</p>
                      <p className="text-xs text-muted-400">{rate.purityLabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="numeric text-gold-400">{formatNPR(rate.ratePerTola)}</p>
                      <p
                        className={`numeric text-xs ${
                          rate.changeAmount >= 0 ? 'text-emerald-300' : 'text-rose-300'
                        }`}
                      >
                        {formatPercent(rate.changePercent)}
                      </p>
                    </div>
                  </div>
                ))}

            {!isLive && !ratesLoading && (
              <p className="pt-2 text-xs leading-relaxed text-muted-400">
                The daily rate service is not connected yet. These are placeholder values for layout
                only.
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
