import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import Container from '../components/common/Container';
import SectionHeading from '../components/common/SectionHeading';
import RateBoard from '../components/home/RateBoard';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Spinner';
import { fetchRateHistory } from '../services/rateService';
import { rateCategoryLabel } from '../config/rateOptions';
import { formatNPR, formatPercent, tolaToTenGram } from '../utils/formatters';

const LIMIT = 20;

export default function Rates() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['rates', 'history', { page }],
    queryFn: () => fetchRateHistory({ page, limit: LIMIT }),
    placeholderData: keepPreviousData,
  });

  const columns = [
    {
      key: 'effectiveDate',
      header: 'Date',
      render: (row) => (
        <time
          dateTime={row.effectiveDate}
          className="numeric text-sm text-cream-200"
        >
          {new Date(row.effectiveDate).toLocaleDateString('en-GB')}
        </time>
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
      key: 'perTenGram',
      header: 'Per 10 g',
      render: (row) => (
        <span className="numeric text-sm text-cream-200">
          {formatNPR(tolaToTenGram(row.ratePerTola))}
        </span>
      ),
    },
    {
      key: 'change',
      header: 'Change',
      className: 'text-right',
      render: (row) => (
        <Badge
          tone={row.changeAmount > 0 ? 'success' : row.changeAmount < 0 ? 'danger' : 'neutral'}
        >
          {formatPercent(row.changePercent)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="bg-forest-900 pb-24 pt-32 lg:pt-40">
      <Container>
        <SectionHeading
          eyebrow="Today's rates"
          title="Gold and silver rate board"
          aside={
            <span className="text-gold-300/80">Updated each morning after the daily publication</span>
          }
        />
      </Container>

      {/* Same board the home page shows — one component, one source of truth */}
      <RateBoard showHistoryLink={false} />

      <Container className="mt-20">
        <SectionHeading eyebrow="History" title="Previously published rates" />

        <div className="mt-10 border border-cream-200/12 bg-forest-850/40">
          {isLoading && <TableSkeleton rows={8} cols={5} />}

          {isError && (
            <EmptyState
              tone="error"
              title="Could not load rate history"
              description={error?.message || 'Please try again in a moment.'}
            />
          )}

          {data && (
            <>
              <Table
                caption="Published rate history"
                columns={columns}
                rows={data.items}
                getRowKey={(row) => row._id}
                empty={
                  <EmptyState
                    title="No rates published yet"
                    description="Once the shop publishes a daily rate it will be listed here."
                  />
                }
              />

              {data.items.length > 0 && (
                <div className="px-6 pb-6">
                  <Pagination
                    page={data.meta.page}
                    totalPages={data.meta.totalPages}
                    onChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
