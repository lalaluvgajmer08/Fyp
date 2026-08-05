import { cn } from '../../utils/cn';

export function Card({ className, children, ...rest }) {
  return (
    <div className={cn('border border-cream-200/12 bg-forest-850/60', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-4 border-b border-cream-200/10 px-6 py-5',
        className
      )}
    >
      <div>
        <h2 className="font-display text-xl font-normal text-cream-50">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

/** Dashboard metric tile. */
export function StatCard({ label, value, delta, icon }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="eyebrow text-muted-400">{label}</p>
        {icon && <span className="text-gold-400">{icon}</span>}
      </div>

      <p className="numeric mt-4 font-display text-[2.25rem] leading-none text-cream-50">{value}</p>

      {delta && <p className="mt-2 text-xs text-muted-400">{delta}</p>}
    </Card>
  );
}

export default Card;
