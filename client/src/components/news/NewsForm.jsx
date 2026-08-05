import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Textarea, Select } from '../common/Input';
import Button from '../common/Button';
import { Card, CardHeader, CardBody } from '../common/Card';
import { NEWS_CATEGORIES, NEWS_LANGUAGES, NEWS_STATUSES } from '../../config/newsOptions';

const EMPTY = {
  title: '',
  summary: '',
  content: '',
  category: 'general',
  language: 'en',
  status: 'draft',
  coverImage: '',
  source: '',
  tags: '',
  isFeatured: false,
};

/**
 * Shared create/edit form. `initial` is an article document; tags arrive as an
 * array from the API and are edited as a comma-separated string.
 */
export default function NewsForm({ initial, onSubmit, submitting, submitLabel = 'Save article' }) {
  const navigate = useNavigate();

  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY;

    // Spreading `initial` directly would let an absent field (undefined) overwrite
    // the empty-string default and break `.trim()` on submit — so drop those keys.
    const defined = Object.fromEntries(
      Object.entries(initial).filter(([, v]) => v !== undefined && v !== null)
    );

    return { ...EMPTY, ...defined, tags: (initial.tags || []).join(', ') };
  });
  const [errors, setErrors] = useState({});

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    else if (form.title.trim().length < 5) next.title = 'Give the article a fuller title';
    if (!form.summary.trim()) next.summary = 'A short summary is required';
    else if (form.summary.length > 300) next.summary = 'Keep the summary under 300 characters';
    if (!form.content.trim()) next.content = 'Article body is required';
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
      title: form.title.trim(),
      summary: form.summary.trim(),
      content: form.content,
      category: form.category,
      language: form.language,
      status: form.status,
      isFeatured: form.isFeatured,
      coverImage: form.coverImage.trim() || undefined,
      source: form.source.trim() || undefined,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-3">
      {/* Main content */}
      <div className="space-y-6 xl:col-span-2">
        <Card>
          <CardHeader title="Article" subtitle="What customers will read on the storefront" />
          <CardBody className="space-y-5">
            <Input
              label="Title"
              value={form.title}
              onChange={update('title')}
              error={errors.title}
              placeholder="Gold holds steady ahead of the festive season"
              required
            />

            <Textarea
              label="Summary"
              rows={3}
              value={form.summary}
              onChange={update('summary')}
              error={errors.summary}
              hint={`${form.summary.length}/300 characters — shown in listings and previews`}
              placeholder="One or two sentences that stand alone in a list."
              required
            />

            <Textarea
              label="Content"
              rows={14}
              value={form.content}
              onChange={update('content')}
              error={errors.content}
              hint="Plain text. Blank lines separate paragraphs."
              lang={form.language}
              className={form.language === 'ne' ? 'font-devanagari' : undefined}
              required
            />
          </CardBody>
        </Card>
      </div>

      {/* Metadata */}
      <div className="space-y-6">
        <Card>
          <CardHeader title="Publishing" />
          <CardBody className="space-y-5">
            <Select
              label="Status"
              value={form.status}
              onChange={update('status')}
              options={NEWS_STATUSES}
              hint={
                form.status === 'published'
                  ? 'Visible to customers immediately'
                  : 'Hidden from the storefront'
              }
            />

            <Select
              label="Category"
              value={form.category}
              onChange={update('category')}
              options={NEWS_CATEGORIES}
            />

            <Select
              label="Language"
              value={form.language}
              onChange={update('language')}
              options={NEWS_LANGUAGES}
            />

            <label className="flex items-start gap-3 text-sm text-cream-200">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={update('isFeatured')}
                className="mt-0.5 size-4 accent-gold-500"
              />
              <span>
                Feature this article
                <span className="mt-1 block text-xs text-muted-400">
                  Featured articles are pinned to the top of every listing.
                </span>
              </span>
            </label>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Optional details" />
          <CardBody className="space-y-5">
            <Input
              label="Cover image URL"
              type="url"
              value={form.coverImage}
              onChange={update('coverImage')}
              error={errors.coverImage}
              placeholder="https://…"
            />

            <Input
              label="Source"
              value={form.source}
              onChange={update('source')}
              placeholder="FENEGOSIDA, Kantipur, in-house…"
            />

            <Input
              label="Tags"
              value={form.tags}
              onChange={update('tags')}
              hint="Comma separated, e.g. gold, hallmark, festival"
              placeholder="gold, rates"
            />
          </CardBody>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" size="lg" disabled={submitting} className="flex-1">
            {submitting ? 'Saving…' : submitLabel}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => navigate('/admin/news')}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
