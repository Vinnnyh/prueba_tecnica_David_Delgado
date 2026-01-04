import { useState, useEffect } from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Plus } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { TransactionTable } from '@/components/shared/transaction-table';
import { MovementForm } from '@/components/movements/movement-form';
import Papa from 'papaparse';

interface Movement {
  id: string;
  concept: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
}

export default function MovementsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchMovements = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        search: searchQuery,
        ...(dateRange?.from && { from: dateRange.from.toISOString() }),
        ...(dateRange?.to && { to: dateRange.to.toISOString() }),
      });

      const res = await fetch(`/api/movements?${params}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching movements', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [currentPage, pageSize, searchQuery, dateRange]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        all: 'true',
        search: searchQuery,
        ...(dateRange?.from && { from: dateRange.from.toISOString() }),
        ...(dateRange?.to && { to: dateRange.to.toISOString() }),
      });

      const res = await fetch(`/api/movements?${params}`);
      const result = await res.json();
      
      const csvData = result.movements.map((m: any) => ({
        ID: m.id,
        Concept: m.concept,
        Amount: m.amount,
        Type: m.type,
        Date: new Date(m.date).toLocaleDateString(),
        User: m.user?.name || 'N/A'
      }));
      
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `movements_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV', error);
    }
  };

  // Reset to page 1 when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateRange, pageSize]);

  return (
    <PermissionGuard permission="movements:view">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Wallet</h2>
            <p className="text-sm text-gray-500">Manage your historical incomes and expenses</p>
          </div>
          
          <PermissionGuard permission="movements:create" fallback={null}>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/80 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-brand-accent/20"
            >
              <Plus size={20} />
              New Movement
            </button>
          </PermissionGuard>
        </div>

        {showForm && (
          <MovementForm 
            onClose={() => setShowForm(false)} 
            onSuccess={fetchMovements} 
          />
        )}

        <TransactionTable 
          movements={data?.movements || []}
          isLoading={isLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dateRange={dateRange}
          setDateRange={setDateRange}
          title="All Movements"
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={data?.pagination?.total || 0}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          totalBalance={data?.stats?.balance || 0}
          onExport={handleExport}
        />
      </div>
    </PermissionGuard>
  );
}

