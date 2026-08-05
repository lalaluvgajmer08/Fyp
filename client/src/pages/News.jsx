import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import SectionHeading from '../components/common/SectionHeading';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import { cn } from '../utils/cn';
import { fetchNews } from '../services/newsService';
import { NEWS_CATEGORIES, categoryLabel } from '../config/newsOptions';
import { formatLongDate } from '../utils/formatters';

const LIMIT = 9;

export default function News() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['news', 'public', { page, category }],
    queryFn: () => fetchNews({ page, limit: LIMIT, ...(category && { category }) }),
    placeholderData: keepPreviousData,
  });

  const filters = [{ value: '', label: 'All' }, ...NEWS_CATEGORIES];

  return (
    <div className="bg-forest-900 pb-24 pt-32 lg:pt-40">
      <Container>
        <SectionHeading
          eyebrow="News & updates"
          title="Market notes and shop news"
          description="Gold and silver movements, hallmarking rules and what is new in the workshop."
        />

        {/* Category filter */}
        <div className="mt-10 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value || 'all'}
              type="button"
              onClick={() => {
                setCategory(f.value);
                setPage(1);
              }}
              aria-pressed={category === f.value}
              className={cn(
                'border px-4 py-2 text-sm transition-colors',
                category === f.value
                  ? 'border-gold-400 bg-gold-500/10 text-gold-300'
                  : 'border-cream-200/15 text-cream-200 hover:border-cream-200/35'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="animate-pulse space-y-4 border border-cream-200/12 p-6">
                <div className="h-4 w-24 bg-cream-200/10" />
                <div className="h-6 w-full bg-cream-200/10" />
                <div className="h-16 w-full bg-cream-200/10" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <EmptyState
            tone="error"
            title="Could not load the news"
            description={error?.message || 'Please try again in a moment.'}
          />
        )}

        {data && data.items.length === 0 && (
          <EmptyState
            title="Nothing published yet"
            description="Market notes and shop updates will appear here as they are posted."
            action={{ label: 'Back to home', to: '/' }}
          />
        )}

        {data && data.items.length > 0 && (
          <>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((article) => (
                <article
                  key={article._id}
                  className="group relative flex flex-col border border-cream-200/12 bg-forest-850/40 transition-colors hover:border-gold-400/40"
                >
                  {article.coverImage ? (
                    <img
                      src={article.coverImage}
                      alt=""
                      loading="lazy"
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    /* Keeps card heights even when an article has no cover */
                    <div className="h-44 w-full bg-forest-850/60" />
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <p className="eyebrow text-gold-500">{categoryLabel(article.category)}</p>

                    <h2 className="mt-3 font-display text-xl font-normal leading-snug text-cream-50">
                      {/* Stretched link keeps the whole card clickable without nesting anchors */}
                      <Link
                        to={`/news/${article.slug}`}
                        className="transition-colors before:absolute before:inset-0 group-hover:text-gold-300"
                      >
                        {article.title}
                      </Link>
                    </h2>

                    <p
                      className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-400"
                      lang={article.language}
                    >
                      {article.summary}
                    </p>

                    {article.publishedAt && (
                      <time dateTime={article.publishedAt} className="mt-5 text-xs text-muted-400/80">
                        {formatLongDate(article.publishedAt)}
                      </time>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
          </>
        )}
      </Container>
    </div>
  );
}
