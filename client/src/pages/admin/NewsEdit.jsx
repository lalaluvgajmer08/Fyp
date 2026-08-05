import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import NewsForm from '../../components/news/NewsForm';
import EmptyState from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Spinner';
import { Card, CardBody } from '../../components/common/Card';
import { fetchNewsById, updateNews } from '../../services/newsService';
import { useToast } from '../../context/ToastContext';

export default function NewsEdit() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['news', 'detail', id],
    queryFn: () => fetchNewsById(id),
  });

  const mutation = useMutation({
    mutationFn: (payload) => updateNews(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Article updated');
      navigate('/admin/news');
    },
    onError: (err) => toast.error(err.message || 'Could not update the article'),
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardBody className="space-y-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-24" />
            <Skeleton className="h-64" />
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
          title="Could not load this article"
          description={error?.message || 'It may have been deleted.'}
          action={{ label: 'Back to articles', to: '/admin/news' }}
        />
      </Card>
    );
  }

  return (
    // key remounts the form once the article arrives, so its initial state is correct
    <NewsForm
      key={data._id}
      initial={data}
      onSubmit={mutation.mutate}
      submitting={mutation.isPending}
      submitLabel="Save changes"
    />
  );
}
