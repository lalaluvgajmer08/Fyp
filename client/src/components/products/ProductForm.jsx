import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Textarea, Select } from '../common/Input';
import Button from '../common/Button';
import { Card, CardHeader, CardBody } from '../common/Card';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_METALS,
  PRODUCT_STATUSES,
  puritiesForMetal,
} from '../../config/productOptions';
import { formatNPR, TOLA_IN_GRAMS } from '../../utils/formatters';
import { useTodayRates } from '../../hooks/useTodayRates';

const EMPTY = {
  name: '',
  description: '',
  category: 'ring',
  metal: 'gold',
  purity: 'HALLMARK_GOLD',
  grossWeight: '',
  netWeight: '',
  makingCharge: '',
  stoneWeight: '',
  stoneValue: '',
  sku: '',
  stockQuantity: '1',
  coverImage: '',
  craftNotes: '',
  hallmarkId: '',
  status: 'available',
  isFeatured: false,
};

/** Number field values arrive as strings; '' means "not supplied". */
const toNumber = (value, fallback = 0) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Shared create/edit form for a product.
 * `initial` is a product document from the API.
 */
export default function ProductForm({ initial, onSubmit, submitting, submitLabel = 'Save product' }) {
  const navigate = useNavigate();
  const { data: rates } = useTodayRates();

  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY;

    // Undefined fields would overwrite the '' defaults and break String methods
    const defined = Object.fromEntries(
      Object.entries(initial).filter(([, v]) => v !== undefined && v !== null)
    );

    // Numbers must become strings for controlled inputs
    const numericKeys = ['grossWeight', 'netWeight', 'makingCharge', 'stoneWeight', 'stoneValue', 'stockQuantity'];
    numericKeys.forEach((key) => {
      if (defined[key] !== undefined) defined[key] = String(defined[key]);
    });

    return { ...EMPTY, ...defined };
  });
  const [errors, setErrors] = useState({});

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setForm((f) => {
      const next = { ...f, [key]: value };

      // Switching metal invalidates the purity — snap to the first valid one
      if (key === 'metal') {
        const options = puritiesForMetal(value);
        if (!options.some((o) => o.value === next.purity)) {
          next.purity = options[0]?.value ?? '';
        }
      }

      return next;
    });

    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) next.name = 'Product name is required';
    else if (form.name.trim().length < 3) next.name = 'Give the piece a fuller name';

    const gross = toNumber(form.grossWeight, NaN);
    const net = toNumber(form.netWeight, NaN);
    const making = toNumber(form.makingCharge, NaN);

    if (form.grossWeight === '' || !Number.isFinite(gross) || gross <= 0) {
      next.grossWeight = 'Enter the gross weight in grams';
    }
    if (form.netWeight === '' || !Number.isFinite(net) || net <= 0) {
      next.netWeight = 'Enter the net weight in grams';
    } else if (Number.isFinite(gross) && net > gross) {
      next.netWeight = 'Net weight cannot exceed the gross weight';
    }
    if (form.makingCharge === '' || !Number.isFinite(making) || making < 0) {
      next.makingCharge = 'Enter the making charge in NPR';
    }
    if (form.coverImage && !/^https?:\/\//.test(form.coverImage)) {
      next.coverImage = 'Enter a full URL starting with http:// or https://';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      metal: form.metal,
      purity: form.purity,
      grossWeight: toNumber(form.grossWeight),
      netWeight: toNumber(form.netWeight),
      makingCharge: toNumber(form.makingCharge),
      stoneWeight: toNumber(form.stoneWeight),
      stoneValue: toNumber(form.stoneValue),
      stockQuantity: toNumber(form.stockQuantity, 1),
      status: form.status,
      isFeatured: form.isFeatured,
      sku: form.sku.trim() || undefined,
      coverImage: form.coverImage.trim() || undefined,
      craftNotes: form.craftNotes.trim() || undefined,
      hallmarkId: form.hallmarkId.trim() || undefined,
    });
  };

  // Live preview of what the customer will be quoted, using today's board
  const rate = rates?.find((r) => r.category === form.purity);
  const net = toNumber(form.netWeight);
  const metalValue = rate ? (rate.ratePerTola / TOLA_IN_GRAMS) * net : null;
  const estimate =
    metalValue == null ? null : metalValue + toNumber(form.makingCharge) + toNumber(form.stoneValue);

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-3">
      {/* Main details */}
      <div className="space-y-6 xl:col-span-2">
        <Card>
          <CardHeader title="The piece" subtitle="What customers see in the catalogue" />
          <CardBody className="space-y-5">
            <Input
              label="Name"
              value={form.name}
              onChange={update('name')}
              error={errors.name}
              placeholder="Classic Hallmark Wedding Band"
              required
            />

            <Textarea
              label="Description"
              rows={4}
              value={form.description}
              onChange={update('description')}
              hint="One short paragraph. Shown on the catalogue card and the product page."
              placeholder="A plain, comfortable-fit band in 22K hallmark gold…"
            />

            <Select
              label="Category"
              value={form.category}
              onChange={update('category')}
              options={PRODUCT_CATEGORIES}
            />

            <Textarea
              label="Workshop notes"
              rows={3}
              value={form.craftNotes}
              onChange={update('craftNotes')}
              hint="Optional. Sizing, lead time, or how the piece is finished."
              placeholder="Hand-finished and polished. Sizing included."
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Metal, weight and charges"
            subtitle="These determine the price — no price is stored, it is calculated from the day's rate"
          />
          <CardBody className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Metal"
                value={form.metal}
                onChange={update('metal')}
                options={PRODUCT_METALS}
              />

              <Select
                label="Purity"
                value={form.purity}
                onChange={update('purity')}
                options={puritiesForMetal(form.metal)}
                hint="Sets which rate the price is calculated from"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Gross weight (g)"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={form.grossWeight}
                onChange={update('grossWeight')}
                error={errors.grossWeight}
                placeholder="6.20"
                required
              />

              <Input
                label="Net weight (g)"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={form.netWeight}
                onChange={update('netWeight')}
                error={errors.netWeight}
                hint="Metal only — excludes stones"
                placeholder="6.20"
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Making charge (Rs)"
                type="number"
                step="1"
                min="0"
                inputMode="numeric"
                value={form.makingCharge}
                onChange={update('makingCharge')}
                error={errors.makingCharge}
                placeholder="4500"
                required
              />

              <Input
                label="Stone value (Rs)"
                type="number"
                step="1"
                min="0"
                inputMode="numeric"
                value={form.stoneValue}
                onChange={update('stoneValue')}
                hint="Leave blank if the piece has no stones"
                placeholder="0"
              />
            </div>

            <Input
              label="Stone weight (g)"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={form.stoneWeight}
              onChange={update('stoneWeight')}
              hint="Recorded for the certificate; does not affect the metal value"
              placeholder="0"
            />

            {/* Live estimate so staff can sanity-check before saving */}
            <div className="border border-gold-400/25 bg-gold-500/[0.06] p-5">
              <p className="eyebrow text-gold-400/90">Today&rsquo;s estimate</p>

              {estimate == null ? (
                <p className="mt-2 text-sm text-muted-400">
                  No rate published for this purity yet — the catalogue will show &ldquo;price on
                  request&rdquo;.
                </p>
              ) : (
                <>
                  <p className="numeric mt-2 font-display text-3xl text-cream-50">
                    {formatNPR(estimate)}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-400">
                    {net}g at {formatNPR(rate.ratePerTola / TOLA_IN_GRAMS)}/g ={' '}
                    {formatNPR(metalValue)} metal + {formatNPR(toNumber(form.makingCharge))} making
                    {toNumber(form.stoneValue) > 0 && <> + {formatNPR(toNumber(form.stoneValue))} stone</>}
                  </p>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Inventory sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader title="Availability" />
          <CardBody className="space-y-5">
            <Select
              label="Status"
              value={form.status}
              onChange={update('status')}
              options={PRODUCT_STATUSES}
              hint={
                form.status === 'available'
                  ? 'Listed in the public catalogue'
                  : form.status === 'reserved'
                    ? 'Listed, but marked as reserved'
                    : 'Hidden from the public catalogue'
              }
            />

            <Input
              label="Stock quantity"
              type="number"
              step="1"
              min="0"
              inputMode="numeric"
              value={form.stockQuantity}
              onChange={update('stockQuantity')}
              hint="Use 0 for made-to-order pieces"
            />

            <label className="flex items-start gap-3 text-sm text-cream-200">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={update('isFeatured')}
                className="mt-0.5 size-4 accent-gold-500"
              />
              <span>
                Feature this piece
                <span className="mt-1 block text-xs text-muted-400">
                  Featured pieces are pinned to the top of the catalogue and shown on the home page.
                </span>
              </span>
            </label>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Identification" />
          <CardBody className="space-y-5">
            <Input
              label="SKU"
              value={form.sku}
              onChange={update('sku')}
              hint="Must be unique across the catalogue"
              placeholder="JMS-RNG-001"
            />

            <Input
              label="Hallmark ID (HUID)"
              value={form.hallmarkId}
              onChange={update('hallmarkId')}
              hint="Printed on the invoice for gold pieces"
              placeholder="HUID-9999-2481"
            />

            <Input
              label="Cover image URL"
              type="url"
              value={form.coverImage}
              onChange={update('coverImage')}
              error={errors.coverImage}
              placeholder="https://…"
            />
          </CardBody>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" size="lg" disabled={submitting} className="flex-1">
            {submitting ? 'Saving…' : submitLabel}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
