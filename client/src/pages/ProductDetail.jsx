import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Spinner';
import { fetchProductBySlug } from '../services/productService';
import {
  categoryLabel,
  purityLabel,
  PRODUCT_STATUS_TONE,
} from '../config/productOptions';
import { formatNPR, formatLongDate } from '../utils/formatters';

/** One line of the price breakdown. */
function PriceRow({ label, value, hint, emphasis }) {
  
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <div>
        <p className={emphasis ? 'text-cream-50' : 'text-sm text-muted-400'}>{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-400/70">{hint}</p>}
      </div>
      <p
        className={
          emphasis
            ? 'numeric font-display text-2xl text-gold-300'
            : 'numeric text-sm text-cream-200'
        }
      >
        {value}
      </p>
    </div>
  );
}

/** Gross/net weight and certification facts. */
function SpecRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-cream-200/8 py-3 last:border-0">
      <p className="text-sm text-muted-400">{label}</p>
      <p className="numeric text-sm text-cream-100">{value}</p>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['products', 'detail', slug],
    queryFn: () => fetchProductBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="bg-forest-900 pb-24 pt-32 lg:pt-40">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <Skeleton className="h-[28rem]" />
            <div className="space-y-5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-56 w-full" />
            </div>
          </div>
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
            title="Could not load this piece"
            description={error?.message || 'It may have been sold or removed from the catalogue.'}
            action={{ label: 'Back to the collection', to: '/collection' }}
          />
        </Container>
      </div>
    );
  }

  const { pricing } = product;
  const isPriced = pricing?.totalPrice != null;

  return (
    <div className="bg-forest-900 pb-24 pt-32 lg:pt-40">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-400">
          <Link to="/collection" className="transition-colors hover:text-gold-400">
            The collection
          </Link>
          <span className="mx-2 text-muted-400/50">/</span>
          <span className="text-cream-200">{categoryLabel(product.category)}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Imagery */}
          <div>
            {product.coverImage ? (
              <img
                src={product.coverImage}
                alt={product.name}
                className="w-full border border-cream-200/12 object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center border border-cream-200/12 bg-forest-850/40">
                <p className="font-display text-lg text-muted-400/60">
                  Photography coming soon
                </p>
              </div>
            )}

            {product.images?.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full border border-cream-200/12 object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow text-gold-500">{categoryLabel(product.category)}</p>
              <Badge tone={PRODUCT_STATUS_TONE[product.status]}>{product.status}</Badge>
            </div>

            <h1 className="mt-4 font-display text-[2.5rem] font-light leading-tight text-cream-50">
              {product.name}
            </h1>

            {product.description && (
              <p className="mt-5 text-lg leading-relaxed text-muted-400">{product.description}</p>
            )}

            {/* Price breakdown — the shop's selling point is showing this openly */}
            <section
              aria-labelledby="price-heading"
              className="mt-10 border border-cream-200/12 bg-forest-850/40 p-6"
            >
              <h2 id="price-heading" className="eyebrow text-muted-400">
                Price breakdown
              </h2>

              {isPriced ? (
                <>
                  <div className="mt-4 divide-y divide-cream-200/8">
                    <PriceRow
                      label="Metal value"
                      hint={`${product.netWeight}g net at ${formatNPR(pricing.ratePerGram)}/g`}
                      value={formatNPR(pricing.metalValue)}
                    />
                    <PriceRow label="Making charge" value={formatNPR(pricing.makingCharge)} />
                    {pricing.stoneValue > 0 && (
                      <PriceRow label="Stone value" value={formatNPR(pricing.stoneValue)} />
                    )}
                    <PriceRow label="Total" value={formatNPR(pricing.totalPrice)} emphasis />
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-muted-400/80">
                    Calculated at the {purityLabel(product.purity)} rate of{' '}
                    {formatNPR(pricing.ratePerTola)} per tola
                    {pricing.pricedAt && <> published {formatLongDate(pricing.pricedAt)}</>}. The
                    metal rate moves daily, so the final price is confirmed at the counter.
                  </p>
                </>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-muted-400">
                  No rate has been published for this purity yet. Please contact the shop for a
                  current quotation.
                </p>
              )}
            </section>

            {/* Specifications */}
            <section aria-labelledby="spec-heading" className="mt-8">
              <h2 id="spec-heading" className="eyebrow text-muted-400">
                Specifications
              </h2>

              <div className="mt-3">
                <SpecRow label="Purity" value={purityLabel(product.purity)} />
                <SpecRow label="Gross weight" value={`${product.grossWeight} g`} />
                <SpecRow label="Net weight" value={`${product.netWeight} g`} />
                {product.stoneWeight > 0 && (
                  <SpecRow label="Stone weight" value={`${product.stoneWeight} g`} />
                )}
                {product.sku && <SpecRow label="SKU" value={product.sku} />}
                {product.hallmarkId && <SpecRow label="Hallmark ID" value={product.hallmarkId} />}
                {product.status === 'available' && (
                  <SpecRow
                    label="In stock"
                    value={product.stockQuantity > 0 ? `${product.stockQuantity}` : 'Made to order'}
                  />
                )}
              </div>
            </section>

            {product.craftNotes && (
              <section className="mt-8 border-l-2 border-gold-400/40 pl-5">
                <h2 className="eyebrow text-muted-400">From the workshop</h2>
                <p className="mt-2 text-sm leading-relaxed text-cream-200">{product.craftNotes}</p>
              </section>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <Button to="/visit" variant="primary" size="lg">
                Enquire at the shop
              </Button>
              <Button to="/collection" variant="outline" size="lg">
                Back to the collection
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
