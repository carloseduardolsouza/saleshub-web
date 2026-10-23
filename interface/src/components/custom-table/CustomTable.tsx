import { type ReactNode, useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from 'lucide-react';
import './CustomTable.css';

export interface TableColumn<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => ReactNode;
}

interface CustomTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey?: (row: T, index: number) => string | number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
  loading?: boolean;
  stickyHeader?: boolean;
  compact?: boolean;
}

type SortDir = 'asc' | 'desc' | null;

export function CustomTable<T extends object>({
  columns,
  data,
  rowKey,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription,
  emptyIcon,
  onRowClick,
  loading = false,
  stickyHeader = true,
  compact = false,
}: CustomTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  function handleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), 'pt-BR', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  if (loading) {
    return (
      <div className="ct-wrapper">
        <table className={`ct ${compact ? 'ct--compact' : ''}`}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="ct__skeleton-row">
                {columns.map((col) => (
                  <td key={col.key}>
                    <div className="ct__skeleton" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="ct-wrapper">
      <table className={`ct ${compact ? 'ct--compact' : ''}`}>
        <thead className={stickyHeader ? 'ct__thead--sticky' : undefined}>
          <tr>
            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`${col.sortable ? 'ct__th--sortable' : ''} ${col.align ? `ct__th--${col.align}` : ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  tabIndex={col.sortable ? 0 : undefined}
                  onKeyDown={col.sortable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(col.key); } } : undefined}
                  aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <span className="ct__th-content">
                    {col.header}
                    {col.sortable && (
                      <span className={`ct__sort-icon ${isSorted ? 'ct__sort-icon--active' : ''}`}>
                        {isSorted && sortDir === 'asc' ? (
                          <ArrowUp size={13} />
                        ) : isSorted && sortDir === 'desc' ? (
                          <ArrowDown size={13} />
                        ) : (
                          <ArrowUpDown size={13} />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="ct__empty">
                <div className="ct__empty-content">
                  <div className="ct__empty-icon">
                    {emptyIcon || <Inbox size={40} />}
                  </div>
                  <p className="ct__empty-title">{emptyTitle}</p>
                  {emptyDescription && (
                    <p className="ct__empty-description">{emptyDescription}</p>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((row, idx) => (
              <tr
                key={rowKey ? rowKey(row, idx) : idx}
                className={`ct__row ${onRowClick ? 'ct__row--clickable' : ''}`}
                onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row, idx);
                        }
                      }
                    : undefined
                }
                role={onRowClick ? 'button' : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={col.align ? `ct__td--${col.align}` : undefined}
                  >
                    {col.render
                      ? col.render(row, idx)
                      : ((row as Record<string, unknown>)[col.key] as ReactNode) ?? <span className="ct__td--muted">-</span>}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
