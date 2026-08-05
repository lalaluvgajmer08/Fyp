import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { TableSkeleton } from '../../components/common/Spinner';
import { Input } from '../../components/common/Input';
import { fetchTodayRates, fetchRateHistory, saveRate } from '../../services/rateService';
import { RATE_CATEGORIES, rateCategoryLabel } from '../../config/rateOptions';
import { formatNPR, formatPercent, formatLongDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

const LIMIT = 20;

/** Today's date as yyyy-mm-dd for the date input, in local time. */
const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export default function RatesAdmin() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [effectiveDate, setEffectiveDate] = useState(todayISO());
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const today = useQuery({
    queryKey: ['rates', 'today'],
    queryFn: fetchTodayRates,
  });

  const history = useQuery({
    queryKey: ['rates', 'history', { page }],
    queryFn: () => fetchRateHistory({ page, limit: LIMIT }),
  });

  const mutation = useMutation({
    mutationFn: saveRate,
    // Invalidating ['rates'] refreshes this page and the storefront board,
    // which share the same query cache.
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['rates'] });
      setValues((v) => ({ ...v, [saved.category]: '' }));
      toast.success(`${rateCategoryLabel(saved.category)} rate published`);
    },
    onError: (err) => toast.error(err.message || 'Could not publish the rate'),
  });

  const publish = (category) => {
    const meta = RATE_CATEGORIES.find((c) => c.value === category);
    const raw = values[category];

    if (!raw || !raw.toString().trim()) {
      setErrors((e) => ({ ...e, [category]: 'Enter a rate' }));
      return;
    }

    const rate = Number(raw);
    if (!Number.isFinite(rate) || rate <= 0) {
      setErrors((e) => ({ ...e, [category]: 'Enter a positive number' }));
      return;
    }

    setErrors((e) => ({ ...e, [category]: undefined }));

    mutation.mutate({
      metal: meta.metal,
      category: meta.value,
      label: meta.label,
      purityLabel: meta.purityLabel,
      ratePerTola: rate,
      effectiveDate,
      source: 'manual',
    });
  };

  const currentFor = (category) =>
    today.data?.find((r) => r.category === category);

  const columns = [
    {
      key: 'effectiveDate',
      header: 'Date',
      render: (row) => (
        <span className="numeric text-sm text-cream-200">
          {new Date(row.effectiveDate).toLocaleDateString('en-GB')}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Metal',
      render: (row) => (
        <div>
          <p className="text-sm text-cream-50">{rateCategoryLabel(row.category)}</p>
          <p className="text-xs text-muted-400">{row.purityLabel}</p>
        </div>
      ),
    },
    {
      key: 'ratePerTola',
      header: 'Per tola',
      render: (row) => (
        <span className="numeric text-gold-400">{formatNPR(row.ratePerTola)}</span>
      ),
    },
    {
      key: 'change',
      header: 'Change',
      render: (row) => (
        <Badge tone={row.changeAmount > 0 ? 'success' : row.changeAmount < 0 ? 'danger' : 'neutral'}>
          {formatPercent(row.changePercent)}
        </Badge>
      ),
    },
    {
      key: 'publishedBy',
      header: 'Published by',
      render: (row) => (
        <span className="text-sm text-muted-400">{row.publishedBy?.name ?? '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Publish form */}
      <Card>
        <CardHeader
          title="Publish today's rates"
          subtitle="Saving twice for the same date corrects the entry rather than duplicating it"
          action={
            <div className="w-44">
              <Input
                label="Effective date"
                type="date"
                value={effectiveDate}
                max={todayISO()}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
          }
        />

        <CardBody className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {RATE_CATEGORIES.map((cat) => {
            const current = currentFor(cat.value);

            return (
              <div key={cat.value} className="space-y-3 border border-cream-200/12 p-5">
                <div>
                  <p className="text-sm text-cream-50">{cat.label}</p>
                  <p className="text-xs text-muted-400">{cat.purityLabel}</p>
                </div>

                <div className="border-t border-cream-200/10 pt-3">
                  <p className="text-xs text-muted-400">Current</p>
                  <p className="numeric text-gold-400">
                    {current ? formatNPR(current.ratePerTola) : 'Not published'}
                  </p>
                </div>

                <Input
                  label="New rate (per tola)"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="285000"
                  value={values[cat.value] ?? ''}
                  error={errors[cat.value]}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, [cat.value]: e.target.value }));
                    setErrors((err) => ({ ...err, [cat.value]: undefined }));
                  }}
                />

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  disabled={mutation.isPending}
                  onClick={() => publish(cat.value)}
                >
                  {mutation.isPending ? 'Saving…' : 'Publish'}
                </Button>
              </div>
            );
          })}
        </CardBody>
      </Card>

      {/* History */}
      <Card>
        <CardHeader title="Rate history" subtitle="Every rate published, newest first" />

        {history.isLoading && <TableSkeleton rows={6} cols={5} />}

        {history.isError && (
          <EmptyState
            tone="error"
            title="Could not load rate history"
            description={history.error?.message || 'The server did not respond.'}
          />
        )}

        {history.isSuccess && (
          <>
            <Table
              caption="Published rates"
              columns={columns}
              rows={history.data.items}
              getRowKey={(row) => row._id}
              empty={
                <EmptyState
                  title="No rates published yet"
                  description="Publish today's gold and silver rates using the form above."
                />
              }
            />

            {history.data.items.length > 0 && (
              <div className="px-6 pb-6">
                <Pagination
                  page={history.data.meta.page}
                  totalPages={history.data.meta.totalPages}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {today.isSuccess && today.data.length === 0 && (
        <p className="text-sm text-muted-400">
          The storefront is currently showing indicative placeholder rates. Publish a rate above and
          it will appear on the customer site immediately.
        </p>
      )}
    </div>
  );
}
