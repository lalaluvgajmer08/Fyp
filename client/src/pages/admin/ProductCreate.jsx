import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import { createProduct } from '../../services/productService';
import { useToast } from '../../context/ToastContext';

export default function ProductCreate() {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        product.status === 'available' ? 'Product listed' : 'Draft saved'
      );
      navigate('/admin/products');
    },
    onError: (err) => toast.error(err.message || 'Could not save the product'),
  });

  return (
    <ProductForm
      onSubmit={mutation.mutate}
      submitting={mutation.isPending}
      submitLabel="Add to catalogue"
    />
  );
}
