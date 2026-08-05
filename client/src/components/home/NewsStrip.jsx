import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';
import Button from '../common/Button';
import { fetchLatestNews } from '../../services/newsService';

const CATEGORY_LABELS = {
  gold_market: 'Gold market',
  silver_market: 'Silver market',
  industry: 'Industry',
  shop_update: 'Shop update',
  general: 'General',
};

export default function NewsStrip() {
  const { data: articles = [], isLoading, isError } = useQuery({
    queryKey: ['news', 'latest', 3],
    queryFn: () => fetchLatestNews(3),
    staleTime: 5 * 60 * 1000,
  });

  // Nothing published yet is a normal state on a fresh install — stay quiet
  if (!isLoading && (isError || articles.length === 0)) return null;

  return (
    <section aria-labelledby="news-heading" className="bg-forest-900 py-20 lg:py-24">
      <Container>
        <SectionHeading
          id="news-heading"
          eyebrow="News & updates"
          title="From the workshop"
          aside={
            <Link to="/news" className="text-gold-400 transition-colors hover:text-gold-300">
              All updates →
            </Link>
          }
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="animate-pulse space-y-4 border border-cream-200/12 p-6">
                  <div className="h-4 w-20 bg-cream-200/10" />
                  <div className="h-6 w-full bg-cream-200/10" />
                  <div className="h-16 w-full bg-cream-200/10" />
                </div>
              ))
            : articles.map((article) => (
                <article
                  key={article._id}
                  className="group flex flex-col border border-cream-200/12 bg-forest-850/40 transition-colors hover:border-gold-400/40"
                >
                  {article.coverImage && (
                    <img
                      src={article.coverImage}
                      alt=""
                      loading="lazy"
                      className="h-44 w-full object-cover"
                    />
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <p className="eyebrow text-gold-500">
                      {CATEGORY_LABELS[article.category] ?? article.category}
                    </p>

                    <h3 className="mt-3 font-display text-xl font-normal leading-snug text-cream-50">
                      <Link
                        to={`/news/${article.slug}`}
                        className="transition-colors after:absolute group-hover:text-gold-300"
                      >
                        {article.title}
                      </Link>
                    </h3>

                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-400">
                      {article.summary}
                    </p>

                    {article.publishedAt && (
                      <time
                        dateTime={article.publishedAt}
                        className="mt-5 text-xs text-muted-400/80"
                      >
                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    )}
                  </div>
                </article>
              ))}
        </div>

        <div className="mt-10 md:hidden">
          <Button to="/news" variant="outline" size="md" className="w-full">
            All updates
          </Button>
        </div>
      </Container>
    </section>
  );
}
