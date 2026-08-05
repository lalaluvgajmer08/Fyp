
import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import SectionHeading from '../components/common/SectionHeading';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import { cn } from '../utils/cn';
import { fetchProducts } from '../services/productService';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_METALS,
  PRODUCT_SORTS,
  categoryLabel,
  purityLabel,
} from '../config/productOptions';
import { formatNPR } from '../utils/formatters';

const LIMIT = 12;

export default function Collection() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [metal, setMetal] = useState('');
  const [sort, setSort] = useState('newest');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', 'public', { page, category, metal, sort }],
    queryFn: () => fetchProducts({ page, limit: LIMIT, category, metal, sort }),
    placeholderData: keepPreviousData,
  });

  const categoryFilters = [{ value: '', label: 'All categories' }, ...PRODUCT_CATEGORIES];
  const metalFilters = [{ value: '', label: 'All metals' }, ...PRODUCT_METALS];

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="bg-forest-900 pb-24 pt-32 lg:pt-40">
      <Container>
        <SectionHeading
          eyebrow="The collection"
          title="Rings, necklaces and heirloom sets"
          description="Every piece is priced at the day's live metal rate, with the gross and net weight and making charge shown transparently."
        />

        {/* Filters */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((f) => (
              <button
                key={f.value || 'all'}
                type="button"
                onClick={() => resetPage(setCategory)(f.value)}
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

          <div className="h-px w-full md:w-px md:h-8 bg-cream-200/10" />

          <div className="flex flex-wrap gap-2">
            {metalFilters.map((f) => (
              <button
                key={f.value || 'all'}
                type="button"
                onClick={() => resetPage(setMetal)(f.value)}
                aria-pressed={metal === f.value}
                className={cn(
                  'border px-4 py-2 text-sm transition-colors',
                  metal === f.value
                    ? 'border-gold-400 bg-gold-500/10 text-gold-300'
                    : 'border-cream-200/15 text-cream-200 hover:border-cream-200/35'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="ml-auto">
            <select
              value={sort}
              onChange={(e) => resetPage(setSort)(e.target.value)}
              className="bg-forest-850 border border-cream-200/15 px-4 py-2 text-sm text-cream-200 transition-colors hover:border-cream-200/35 focus:border-gold-400 focus:outline-none"
              aria-label="Sort by"
            >
              {PRODUCT_SORTS.map((s) => (
                <option key={s.value} value={s.value} className="bg-forest-900">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="animate-pulse space-y-4 border border-cream-200/12 p-6">
                <div className="h-48 w-full bg-cream-200/10" />
                <div className="h-4 w-24 bg-cream-200/10" />
                <div className="h-6 w-full bg-cream-200/10" />
                <div className="h-8 w-32 bg-cream-200/10" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <EmptyState
            tone="error"
            title="Could not load the catalogue"
            description={error?.message || 'Please try again in a moment.'}
          />
        )}

        {data && data.items.length === 0 && (
          <EmptyState
            title="No pieces match these filters"
            description="Try a different category or metal, or check back soon for new additions."
            action={{ label: 'Reset filters', onClick: () => { setCategory(''); setMetal(''); setPage(1); } }}
          />
        )}

        {data && data.items.length > 0 && (
          <>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((product) => (
                <article
                  key={product._id}
                  className="group relative flex flex-col border border-cream-200/12 bg-forest-850/40 transition-colors hover:border-gold-400/40"
                >
                  {product.coverImage ? (
                    <img
                      src={product.coverImage}
                      alt=""
                      loading="lazy"
                      className="h-64 w-full object-cover"
                    />
                  ) : (
                    /* Keeps card heights even when a piece has no photo yet */
                    <div className="flex h-64 w-full items-center justify-center bg-forest-850/60">
                      <p className="text-sm text-muted-400/60">Photography coming soon</p>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <p className="eyebrow text-gold-500">{categoryLabel(product.category)}</p>

                    <h2 className="mt-3 font-display text-xl font-normal leading-snug text-cream-50">
                      <Link
                        to={`/collection/${product.slug}`}
                        className="transition-colors before:absolute before:inset-0 group-hover:text-gold-300"
                      >
                        {product.name}
                      </Link>
                    </h2>

                    <p className="mt-2 text-xs text-muted-400">
                      {purityLabel(product.purity)} · {product.netWeight}g net
                    </p>

                    {product.description && (
                      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-400">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-5 border-t border-cream-200/10 pt-4">
                      {product.pricing.totalPrice ? (
                        <p className="font-display text-2xl text-cream-50">
                          {formatNPR(product.pricing.totalPrice)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-400">Price on request</p>
                      )}
                    </div>
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
