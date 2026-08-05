import { cn } from '../../utils/cn';

/** Consistent page gutter and max width for every section. */
export default function Container({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag className={cn('mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12', className)} {...rest}>
      {children}
    </Tag>
  );
}
