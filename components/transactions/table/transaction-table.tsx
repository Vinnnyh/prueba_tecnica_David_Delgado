import { useState, useMemo, useRef } from 'react';
import { Search, X, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, ChevronDown, Download, Plus } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { LoadingDots } from '@/components/ui/loading-dots';
import { cn } from '@/lib/utils';
import { NewTransactionButton } from '../new-transaction-button';
import { useAuth } from '@/lib/auth/context';
import { Dropdown } from '@/components/ui/dropdown';

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

const RowsSelector = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
  const options = [5, 10, 20, 50].map(opt => ({ value: opt.toString(), label: opt.toString() }));

  return (
    <Dropdown
      value={value.toString()}
      onChange={(val) => onChange(parseInt(val))}
      options={options}
      position="top"
      className="min-w-[70px]"
    />
  );
};

export const TransactionTable = ({
  movements,
  isLoading,
  searchQuery,
  setSearchQuery,
  dateRange,
  setDateRange,
  title = "Transactions",
  showUser = false,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  totalBalance,
  onExport,
  onAddTransaction
}: TransactionTableProps) => {
  const { permissions, role } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const canExport = role === 'ADMIN' || permissions.includes('movements:export');
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className="bg-brand-card rounded-3xl border border-white/5 flex flex-col min-h-[600px]">
      {/* Header - No overflow hidden here to allow calendar to pop out */}
      <div className="px-8 py-6 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h3 className="font-bold">{title}</h3>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm w-48 sm:w-64 focus:outline-none focus:border-brand-accent/50 focus:bg-white/[0.08] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Date Range Picker */}
          <DateRangePicker 
            value={dateRange}
            onChange={setDateRange}
          />

          <div className="flex items-center gap-2">
            {/* Export Button */}
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
                className="relative flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/10 disabled:opacity-50 overflow-hidden min-w-[100px] justify-center"
                title="Export to CSV"
              >
                {isExporting ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-card/80 backdrop-blur-[2px]">
                    <LoadingDots className="scale-50" dotClassName="bg-brand-accent" />
                  </div>
                ) : (
                  <>
                    <Download size={16} />
                    <span className="hidden sm:inline">Export</span>
                  </>
                )}
              </button>
            )}

            {/* Add Transaction Button */}
            {onAddTransaction && (
              <NewTransactionButton onClick={onAddTransaction} variant="ghost" />
            )}
          </div>
        </div>
      </div>

      {/* Table Container with horizontal scroll if needed */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-8 py-6 font-bold text-center">Concept</th>
              {showUser && <th className="px-8 py-6 font-bold text-center">User</th>}
              <th className="px-8 py-6 font-bold text-center">Date</th>
              <th className="px-8 py-6 font-bold text-center">Type</th>
              <th className="px-8 py-6 font-bold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={showUser ? 5 : 4} className="px-8 py-12">
                  <LoadingDots className="h-12" />
                </td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan={showUser ? 5 : 4} className="px-8 py-12 text-center text-gray-500">No movements found.</td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6 font-bold text-center">{m.concept}</td>
                  {showUser && (
                    <td className="px-8 py-6 text-center">
                      <span className="text-xs font-medium text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-md">
                        {m.user?.name || 'Unknown'}
                      </span>
                    </td>
                  )}
                  <td className="px-8 py-6 text-sm text-gray-400 text-center">
                    {new Date(m.date).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      m.type === 'INCOME' ? 'bg-brand-income/10 text-brand-income' : 'bg-brand-expense/10 text-brand-expense'
                    }`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-right">
                    ${m.amount.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with Total and Pagination */}
      {!isLoading && totalCount > 0 && (
        <div className="px-8 py-6 border-t border-white/5 bg-white/[0.01] rounded-b-3xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Rows:</span>
            <RowsSelector value={pageSize} onChange={onPageSizeChange} />
          </div>

          <div className="flex flex-1 items-center justify-between w-full md:w-auto gap-8">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 font-medium">
                {startIndex + 1}-{Math.min(startIndex + pageSize, totalCount)} of {totalCount}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          currentPage === pageNum 
                            ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' 
                            : 'hover:bg-white/5 text-gray-500'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Balance</span>
              <span className={`text-xl font-black ${totalBalance >= 0 ? 'text-brand-income' : 'text-brand-expense'}`}>
                {totalBalance < 0 ? '-' : ''}${Math.abs(totalBalance).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
