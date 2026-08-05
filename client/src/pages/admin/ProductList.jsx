import { useState } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Spinner';
import { ConfirmDialog } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { fetchProducts, deleteProduct } from '../../services/productService';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_METALS,
  PRODUCT_STATUS_FILTERS,
  PRODUCT_STATUS_TONE,
  categoryLabel,
  purityLabel,
} from '../../config/productOptions';
import { formatNPR } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

const LIMIT = 10;

export default function ProductList() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('');
  const [metal, setMetal] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const params = {
    page,
    limit: LIMIT,
    status,
    ...(category && { category }),
    ...(metal && { metal }),
    ...(search.trim() && { search: search.trim() }),
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', 'admin', params],
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
  });

  const removeMutation = useMutation({
    mutationFn: (id) => deleteProduct(id, false),
    onSuccess: () => {
      toast.success('Product discontinued');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setPendingDelete(null);
    },
    onError: (err) => toast.error(err.message || 'Could not discontinue the product'),
  });

  const withReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (row) => (
        <div className="min-w-0">
          <Link
            to={`/admin/products/${row._id}/edit`}
            className="block max-w-md truncate text-cream-50 transition-colors hover:text-gold-400"
          >
            {row.name}
          </Link>
          <p className="mt-1 text-xs text-muted-400">
            {categoryLabel(row.category)} · {purityLabel(row.purity)}
          </p>
        </div>
      ),
    },
    {
      key: 'weight',
      header: 'Net weight',
      render: (row) => (
        <span className="numeric text-sm text-cream-200">{row.netWeight} g</span>
      ),
    },
    {
      key: 'price',
      header: 'Today’s price',
      render: (row) => (
        <span className="numeric text-sm text-cream-200">
          {row.pricing?.totalPrice ? formatNPR(row.pricing.totalPrice) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={PRODUCT_STATUS_TONE[row.status]}>{row.status}</Badge>,
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) => (
        <span className="numeric text-sm text-muted-400">
          {row.stockQuantity > 0 ? row.stockQuantity : 'Made to order'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          {row.status === 'available' && (
            <Button variant="ghost" size="sm" to={`/collection/${row.slug}`}>
              View
            </Button>
          )}
          <Button variant="ghost" size="sm" to={`/admin/products/${row._id}/edit`}>
            Edit
          </Button>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="px-3 text-sm text-rose-300 transition-colors hover:text-rose-200"
          >
            Discontinue
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-end">
          <Input
            label="Search"
            type="search"
            placeholder="Search names and descriptions…"
            value={search}
            onChange={(e) => withReset(setSearch)(e.target.value)}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => withReset(setStatus)(e.target.value)}
            options={PRODUCT_STATUS_FILTERS}
            className="md:w-40"
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => withReset(setCategory)(e.target.value)}
            options={[{ value: '', label: 'All categories' }, ...PRODUCT_CATEGORIES]}
            className="md:w-48"
          />

          <Select
            label="Metal"
            value={metal}
            onChange={(e) => withReset(setMetal)(e.target.value)}
            options={[{ value: '', label: 'All metals' }, ...PRODUCT_METALS]}
            className="md:w-36"
          />

          <Button to="/admin/products/new" variant="primary" size="md" className="md:h-12">
            Add product
          </Button>
        </div>
      </Card>

      {/* Results */}
      <Card>
        {isLoading && <TableSkeleton rows={5} cols={6} />}

        {isError && (
          <EmptyState
            tone="error"
            title="Could not load the catalogue"
            description={error?.message || 'The server did not respond.'}
          />
        )}

        {data && (
          <>
            <Table
              caption="Products"
              columns={columns}
              rows={data.items}
              empty={
                <EmptyState
                  title="No products match these filters"
                  description="Try a different status, category or metal, or add a new piece."
                  action={{ label: 'Add a product', to: '/admin/products/new' }}
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
        title="Discontinue this product?"
        description={`"${pendingDelete?.name}" will be hidden from the public catalogue. You can restore it by setting its status back to available.`}
        confirmLabel="Discontinue"
      />
    </div>
  );
}
