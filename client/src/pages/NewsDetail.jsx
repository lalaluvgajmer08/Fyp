import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Spinner';
import { fetchNewsBySlug } from '../services/newsService';
import { categoryLabel } from '../config/newsOptions';
import { formatLongDate } from '../utils/formatters';
import { cn } from '../utils/cn';

export default function NewsDetail() {
  const { slug } = useParams();

  const { data: article, isLoading, isError, error } = useQuery({
    queryKey: ['news', 'detail', slug],
    queryFn: () => fetchNewsBySlug(slug),
    retry: false, // a 404 here means the slug is wrong; retrying will not help
  });

  if (isLoading) {
    return (
      <div className="bg-forest-900 pb-24 pt-32 lg:pt-40">
        <Container className="max-w-3xl space-y-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-14" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-72" />
        </Container>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-forest-900 pb-24 pt-32 lg:pt-40">
        <Container>
          <EmptyState
            tone="error"
            title={error?.status === 404 ? 'Article not found' : 'Could not load this article'}
            description={
              error?.status === 404
                ? 'It may have been moved or unpublished.'
                : error?.message || 'Please try again in a moment.'
            }
            action={{ label: 'All updates', to: '/news' }}
          />
        </Container>
      </div>
    );
  }

  const paragraphs = article.content.split(/\n\s*\n/).filter(Boolean);

  return (
    <article className="bg-forest-900 pb-24 pt-32 lg:pt-40">
      <Container className="max-w-3xl">
        <Link to="/news" className="text-sm text-muted-400 transition-colors hover:text-gold-400">
          ← All updates
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="eyebrow text-gold-500">{categoryLabel(article.category)}</p>
          {article.status !== 'published' && <Badge tone="warning">{article.status}</Badge>}
        </div>

        <h1
          className="mt-4 font-display text-4xl font-normal leading-tight text-cream-50 sm:text-5xl"
          lang={article.language}
        >
          {article.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-400">
          {article.publishedAt && (
            <time dateTime={article.publishedAt}>{formatLongDate(article.publishedAt)}</time>
          )}
          {article.author?.name && <span>By {article.author.name}</span>}
          {article.source && <span>Source: {article.source}</span>}
        </div>

        {article.coverImage && (
          <img
            src={article.coverImage}
            alt=""
            className="mt-10 aspect-[16/9] w-full object-cover"
          />
        )}

        <p
          className="mt-10 border-l-2 border-gold-500/60 pl-5 text-lg leading-relaxed text-cream-200"
          lang={article.language}
        >
          {article.summary}
        </p>

        <div
          lang={article.language}
          className={cn(
            'mt-8 space-y-5 text-base leading-loose text-cream-200/90',
            article.language === 'ne' && 'font-devanagari'
          )}
        >
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {article.tags?.length > 0 && (
          <ul className="mt-12 flex flex-wrap gap-2 border-t border-cream-200/10 pt-8">
            {article.tags.map((tag) => (
              <li
                key={tag}
                className="border border-cream-200/15 px-3 py-1 text-xs text-muted-400"
              >
                #{tag}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12">
          <Button to="/news" variant="outline" size="md">
            Read more updates
          </Button>
        </div>
      </Container>
    </article>
  );
}
