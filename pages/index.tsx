import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { TransactionTable } from '@/components/transactions/table/transaction-table';
import { DashboardCharts } from '@/components/transactions/dashboard/dashboard-charts';
import { StatsGrid } from '@/components/transactions/dashboard/stats-grid';
import { TransactionForm } from '@/components/transactions/form/transaction-form';
import { PageHeader } from '@/components/shared/page-header';
import { useMovements } from '@/lib/hooks/use-movements';
import { useExportMovements } from '@/lib/hooks/use-export-movements';
import { useQueryClient } from '@tanstack/react-query';

const Home = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useMovements({
    page: currentPage,
    pageSize,
    search: searchQuery,
    dateRange
  });

  const { handleExport } = useExportMovements();

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSuccess = () => {
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['movements'] });
  };

  const stats = data?.stats || {
    totalIncome: 0,
    totalOutcome: 0,
    balance: 0,
    historicalBalance: 0,
    chartData: []
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Dashboard Overview" />

      <StatsGrid stats={stats} />

      {/* Charts Section */}
      <DashboardCharts 
        chartData={stats.chartData} 
        totalIncome={stats.totalIncome} 
        totalExpense={stats.totalOutcome} 
      />

      {showForm && (
        <TransactionForm 
          onClose={() => setShowForm(false)} 
          onSuccess={handleSuccess} 
        />
      )}

      <TransactionTable 
        movements={data?.movements || []}
        isLoading={isLoading}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={data?.pagination?.total || 0}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        totalBalance={stats.balance}
        onExport={() => handleExport({ searchQuery, dateRange })}
        onAddTransaction={() => setShowForm(true)}
      />
    </div>
  );
};

export default Home;
