import { cn } from '../../utils/cn';

/**
 * Small uppercase label that sits above a section heading
 * ("TODAY'S METAL RATES", "EST. 1974 · JEWEL QUARTER").
 */
export default function Eyebrow({ as: Tag = 'p', className, children }) {
  return <Tag className={cn('eyebrow text-gold-500', className)}>{children}</Tag>;
}
