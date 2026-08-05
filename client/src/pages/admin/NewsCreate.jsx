import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import NewsForm from '../../components/news/NewsForm';
import { createNews } from '../../services/newsService';
import { useToast } from '../../context/ToastContext';

export default function NewsCreate() {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createNews,
    onSuccess: (article) => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success(
        article.status === 'published' ? 'Article published' : 'Draft saved'
      );
      navigate('/admin/news');
    },
    onError: (err) => toast.error(err.message || 'Could not save the article'),
  });

  return (
    <NewsForm
      onSubmit={mutation.mutate}
      submitting={mutation.isPending}
      submitLabel="Create article"
    />
  );
}
