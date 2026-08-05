import Eyebrow from './Eyebrow';
import { cn } from '../../utils/cn';

/** Eyebrow + serif display heading, with optional intro copy and a right-aligned slot. */
export default function SectionHeading({ eyebrow, title, description, aside, id, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className="space-y-3">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2
          id={id}
          className="font-display text-[2.125rem] leading-[1.1] font-light text-cream-50 sm:text-[2.75rem]"
        >
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-base leading-relaxed text-muted-400">{description}</p>
        )}
      </div>

      {aside && <div className="text-sm text-muted-400 md:pb-2">{aside}</div>}
    </div>
  );
}
