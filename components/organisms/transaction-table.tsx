import { useState } from 'react';
import { Download } from 'lucide-react';
import { DateRangePicker } from '@/components/molecules/date-range-picker';
import { DateRange } from 'react-day-picker';
import { LoadingDots } from '@/components/atoms/loading-dots';
import { NewTransactionButton } from '@/components/atoms/new-transaction-button';
import { useAtomValue } from 'jotai';
import { permissionsAtom, isAdminAtom } from '@/lib/auth/atoms';
import { TableSearch } from '@/components/molecules/table-search';
import { TablePagination } from '@/components/molecules/table-pagination';
import { TableSummary } from '@/components/molecules/table-summary';
import { TableRowsSelector } from '@/components/molecules/table-rows-selector';

interface Movement {
  id: string;
  concept: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  user?: {
    name: string;
  };
}

interface TransactionTableProps {
  movements: Movement[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  title?: string;
  showUser?: boolean;
  // Pagination props
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  totalBalance: number;
  onExport?: () => void | Promise<void>;
  onAddTransaction?: () => void;
}

export const TransactionTable = ({
  movements,
  isLoading,
  searchQuery,
  setSearchQuery,
  dateRange,
  setDateRange,
  title = 'Transactions',
  showUser = false,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  totalBalance,
  onExport,
  onAddTransaction,
}: TransactionTableProps) => {
  const permissions = useAtomValue(permissionsAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const canExport = isAdmin || permissions.includes('movements:export');

  const [isExporting, setIsExporting] = useState(false);
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className='bg-brand-card rounded-3xl border border-white/5 flex flex-col min-h-[600px]'>
      {/* Header */}
      <div className='px-8 py-6 border-b border-white/5 flex flex-col xl:flex-row xl:items-center justify-between gap-6'>
        <div className='flex items-center gap-4 shrink-0'>
          <h3 className='font-bold text-lg tracking-tight'>{title}</h3>
          <span className='px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-gray-500 uppercase tracking-widest'>
            {totalCount} Total
          </span>
        </div>

        <div className='flex flex-wrap items-center gap-4'>
          <div className='w-full sm:w-72'>
            <TableSearch value={searchQuery} onChange={setSearchQuery} />
          </div>

          <div className='flex items-center gap-3'>
            <div className='h-8 w-px bg-white/10 hidden md:block' />

            <DateRangePicker value={dateRange} onChange={setDateRange} />

            <div className='h-8 w-px bg-white/10 hidden md:block' />

            <div className='flex items-center gap-2'>
              {onExport && canExport && (
                <button
                  onClick={async () => {
                    setIsExporting(true);
                    try {
                      await onExport();
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                  disabled={isExporting}
                  className='relative flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/10 disabled:opacity-50 overflow-hidden h-[42px] justify-center min-w-[100px]'
                  title='Export to CSV'
                >
                  {isExporting ? (
                    <div className='absolute inset-0 flex items-center justify-center bg-brand-card/80 backdrop-blur-[2px]'>
                      <LoadingDots
                        className='w-10'
                        dotClassName='bg-brand-accent'
                      />
                    </div>
                  ) : (
                    <>
                      <Download size={16} />
                      <span className='hidden sm:inline'>Export</span>
                    </>
                  )}
                </button>
              )}

              {onAddTransaction && (
                <NewTransactionButton
                  onClick={onAddTransaction}
                  variant='ghost'
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className='overflow-x-auto flex-1'>
        <table className='w-full border-collapse min-w-[900px]'>
          <thead>
            <tr className='border-b border-white/5 text-gray-500 text-[10px] uppercase tracking-[0.2em]'>
              <th className='px-8 py-5 font-black text-left'>Concept</th>
              {showUser && (
                <th className='px-8 py-5 font-black text-center'>User</th>
              )}
              <th className='px-8 py-5 font-black text-center'>Date</th>
              <th className='px-8 py-5 font-black text-center'>Type</th>
              <th className='px-8 py-5 font-black text-right'>Amount</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-white/5'>
            {isLoading ? (
              <tr>
                <td colSpan={showUser ? 5 : 4} className='px-8 py-24'>
                  <LoadingDots className='h-12' />
                </td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td
                  colSpan={showUser ? 5 : 4}
                  className='px-8 py-24 text-center'
                >
                  <div className='flex flex-col items-center gap-3 opacity-30'>
                    <div className='w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center'>
                      <span className='text-2xl'>∅</span>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-sm font-bold text-white'>
                        No movements found
                      </p>
                      <p className='text-xs'>
                        Try adjusting your filters or search query
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr
                  key={m.id}
                  className='hover:bg-white/[0.02] transition-colors group'
                >
                  <td className='px-8 py-5 font-bold text-white group-hover:text-brand-accent transition-colors'>
                    {m.concept}
                  </td>
                  {showUser && (
                    <td className='px-8 py-5 text-center'>
                      <span className='text-[10px] font-black text-brand-accent bg-brand-accent/10 px-2.5 py-1 rounded-lg border border-brand-accent/20 uppercase tracking-widest'>
                        {m.user?.name || 'Unknown'}
                      </span>
                    </td>
                  )}
                  <td className='px-8 py-5 text-xs text-gray-500 text-center font-bold'>
                    {new Date(m.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className='px-8 py-5 text-center'>
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        m.type === 'INCOME'
                          ? 'bg-brand-income/10 text-brand-income border-brand-income/20'
                          : 'bg-brand-expense/10 text-brand-expense border-brand-expense/20'
                      }`}
                    >
                      {m.type}
                    </span>
                  </td>
                  <td className='px-8 py-5 font-black text-right text-base'>
                    <span
                      className={
                        m.type === 'INCOME'
                          ? 'text-brand-income'
                          : 'text-brand-expense'
                      }
                    >
                      {m.type === 'INCOME' ? '+' : '-'}$
                      {m.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!isLoading && totalCount > 0 && (
        <div className='px-8 py-6 border-t border-white/5 bg-white/[0.01] rounded-b-3xl'>
          <div className='flex flex-col lg:flex-row justify-between items-center gap-8'>
            {/* Left: Rows Selector & Info */}
            <div className='flex flex-wrap items-center justify-center lg:justify-start gap-6'>
              <div className='flex items-center gap-3'>
                <span className='text-[10px] font-black text-gray-500 uppercase tracking-widest'>
                  Rows
                </span>
                <TableRowsSelector
                  value={pageSize}
                  onChange={onPageSizeChange}
                />
              </div>
              <div className='h-4 w-px bg-white/10 hidden sm:block' />
              <span className='text-xs text-gray-500 font-bold'>
                Showing <span className='text-white'>{startIndex + 1}</span> to{' '}
                <span className='text-white'>
                  {Math.min(startIndex + pageSize, totalCount)}
                </span>{' '}
                of <span className='text-white'>{totalCount}</span>
              </span>
            </div>

            {/* Right: Pagination & Summary */}
            <div className='flex flex-col sm:flex-row items-center gap-8 w-full lg:w-auto justify-center lg:justify-end'>
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
              <div className='h-8 w-px bg-white/10 hidden sm:block' />
              <div className='min-w-[160px] flex justify-center sm:justify-end'>
                <TableSummary label='Total Balance' amount={totalBalance} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
