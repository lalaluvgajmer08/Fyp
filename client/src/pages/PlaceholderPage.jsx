import Container from '../components/common/Container';
import Eyebrow from '../components/common/Eyebrow';

/** Shared shell for public pages that are not built out yet. */
export default function PlaceholderPage({ eyebrow, title, description }) {
  return (
    <Container className="flex min-h-[60vh] flex-col justify-center py-32">
      <div className="max-w-2xl">
        <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
        <h1 className="font-display text-[2.75rem] font-light leading-tight text-cream-50 sm:text-[3.5rem]">
          {title}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-400">{description}</p>
      </div>
    </Container>
  );
}
