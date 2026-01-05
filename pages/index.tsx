import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { TransactionTable } from '@/components/organisms/transaction-table';
import { DashboardCharts } from '@/components/organisms/dashboard-charts';
import { StatsGrid } from '@/components/organisms/stats-grid';
import { TransactionForm } from '@/components/organisms/transaction-form';
import { PageHeader } from '@/components/molecules/page-header';
import { useMovements } from '@/lib/hooks/use-movements';
import { useExportMovements } from '@/lib/hooks/use-export-movements';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardTemplate } from '@/components/templates/dashboard-template';

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
    // Invalidate and refetch to ensure all components (charts, cards, table) update simultaneously
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
    <DashboardTemplate
      header={<PageHeader title="Dashboard Overview" />}
      stats={<StatsGrid stats={stats} />}
      charts={
        <DashboardCharts 
          chartData={stats.chartData} 
          totalIncome={stats.totalIncome} 
          totalExpense={stats.totalOutcome} 
        />
      }
      modal={showForm ? (
        <TransactionForm 
          onClose={() => setShowForm(false)} 
          onSuccess={handleSuccess} 
        />
      ) : null}
      table={
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
      }
    />
  );
};

export default Home;
