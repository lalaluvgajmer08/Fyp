import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import EmptyState from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Spinner';
import { Card, CardBody } from '../../components/common/Card';
import { fetchProductById, updateProduct } from '../../services/productService';
import { useToast } from '../../context/ToastContext';

export default function ProductEdit() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => fetchProductById(id),
  });

  const mutation = useMutation({
    mutationFn: (payload) => updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated');
      navigate('/admin/products');
    },
    onError: (err) => toast.error(err.message || 'Could not update the product'),
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardBody className="space-y-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-24" />
            <Skeleton className="h-32" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <EmptyState
          tone="error"
          title="Could not load this product"
          description={error?.message || 'It may have been deleted.'}
          action={{ label: 'Back to the catalogue', to: '/admin/products' }}
        />
      </Card>
    );
  }

  return (
    <ProductForm
      key={data._id}
      initial={data}
      onSubmit={mutation.mutate}
      submitting={mutation.isPending}
      submitLabel="Save changes"
    />
  );
}
