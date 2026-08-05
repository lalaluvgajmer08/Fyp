import { cn } from '../../utils/cn';

/**
 * Column-driven table.
 * columns: [{ key, header, render?, className?, srOnlyHeader? }]
 * On small screens it scrolls horizontally rather than collapsing,
 * so column alignment stays readable for numeric data.
 */
export default function Table({ columns, rows, getRowKey, empty, caption }) {
  if (!rows?.length) return empty ?? null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[42rem] border-collapse text-left">
        {caption && <caption className="sr-only">{caption}</caption>}

        <thead>
          <tr className="border-b border-cream-200/12">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'eyebrow px-6 py-4 font-normal text-muted-400',
                  col.className,
                  col.srOnlyHeader && 'sr-only'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <tr
              key={getRowKey ? getRowKey(row) : (row._id ?? i)}
              className="border-b border-cream-200/8 transition-colors last:border-0 hover:bg-cream-200/[0.03]"
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-6 py-4 align-middle', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
