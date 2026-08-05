import { useState } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { STATUS_TONE } from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Spinner';
import { ConfirmDialog } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { fetchNews, deleteNews } from '../../services/newsService';
import { NEWS_CATEGORIES, NEWS_STATUS_FILTERS, categoryLabel } from '../../config/newsOptions';
import { useToast } from '../../context/ToastContext';

const LIMIT = 10;

export default function NewsList() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const params = {
    page,
    limit: LIMIT,
    status,
    ...(category && { category }),
    ...(search.trim() && { search: search.trim() }),
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['news', params],
    queryFn: () => fetchNews(params),
    placeholderData: keepPreviousData,
  });

  const removeMutation = useMutation({
    mutationFn: (id) => deleteNews(id, false),
    onSuccess: () => {
      toast.success('Article archived');
      queryClient.invalidateQueries({ queryKey: ['news'] });
      setPendingDelete(null);
    },
    onError: (err) => toast.error(err.message || 'Could not archive the article'),
  });

  // Reset to page 1 whenever a filter changes, or the page may be out of range
  const withReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <div className="min-w-0">
          <Link
            to={`/admin/news/${row._id}/edit`}
            className="block max-w-md truncate text-cream-50 transition-colors hover:text-gold-400"
          >
            {row.title}
          </Link>
          <p className="mt-1 max-w-md truncate text-xs text-muted-400">{row.summary}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <span className="text-sm text-cream-200">{categoryLabel(row.category)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>,
    },
    {
      key: 'publishedAt',
      header: 'Date',
      render: (row) => (
        <span className="numeric text-sm text-muted-400">
          {row.publishedAt
            ? new Date(row.publishedAt).toLocaleDateString('en-GB')
            : new Date(row.createdAt).toLocaleDateString('en-GB')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          {row.status === 'published' && (
            <Button variant="ghost" size="sm" to={`/news/${row.slug}`}>
              View
            </Button>
          )}
          <Button variant="ghost" size="sm" to={`/admin/news/${row._id}/edit`}>
            Edit
          </Button>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="px-3 text-sm text-rose-300 transition-colors hover:text-rose-200"
          >
            Archive
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
          <Input
            label="Search"
            type="search"
            placeholder="Search titles and summaries…"
            value={search}
            onChange={(e) => withReset(setSearch)(e.target.value)}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => withReset(setStatus)(e.target.value)}
            options={NEWS_STATUS_FILTERS}
            className="md:w-40"
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => withReset(setCategory)(e.target.value)}
            options={[{ value: '', label: 'All categories' }, ...NEWS_CATEGORIES]}
            className="md:w-48"
          />

          <Button to="/admin/news/new" variant="primary" size="md" className="md:h-12">
            New article
          </Button>
        </div>
      </Card>

      {/* Results */}
      <Card>
        {isLoading && <TableSkeleton rows={5} cols={5} />}

        {isError && (
          <EmptyState
            tone="error"
            title="Could not load articles"
            description={error?.message || 'The server did not respond.'}
          />
        )}

        {data && (
          <>
            <Table
              caption="News articles"
              columns={columns}
              rows={data.items}
              empty={
                <EmptyState
                  title="No articles match these filters"
                  description="Try a different status or category, or write a new article."
                  action={{ label: 'Write an article', to: '/admin/news/new' }}
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
      </Card>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => removeMutation.mutate(pendingDelete._id)}
        loading={removeMutation.isPending}
        title="Archive this article?"
        description={`"${pendingDelete?.title}" will be hidden from the storefront. You can restore it by setting its status back to published.`}
        confirmLabel="Archive"
      />
    </div>
  );
}
