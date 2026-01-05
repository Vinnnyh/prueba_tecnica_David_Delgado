import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { TransactionTable } from '@/components/organisms/transaction-table';
import { DashboardCharts } from '@/components/organisms/dashboard-charts';
import { PageHeader } from '@/components/molecules/page-header';
import { StatsGrid } from '@/components/organisms/stats-grid';
import { DashboardTemplate } from '@/components/templates/dashboard-template';
import { useMovements } from '@/lib/hooks/use-movements';
import { useExportMovements } from '@/lib/hooks/use-export-movements';

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useMovements({
    global: true,
    page: currentPage,
    pageSize,
    search: searchQuery,
    dateRange,
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

  const stats = data?.stats || {
    totalIncome: 0,
    totalOutcome: 0,
    balance: 0,
    historicalBalance: 0,
    chartData: [],
  };

  return (
    <DashboardTemplate
      permission='admin:view'
      header={
        <PageHeader
          title='Admin Dashboard'
          description='Global overview of all system movements and users'
          icon={ShieldCheck}
        />
      }
      stats={
        <StatsGrid
          stats={stats}
          titles={{
            income: 'Global Income',
            outcome: 'Global Outcome',
            balance: 'System Balance',
            historical: 'Total Assets',
          }}
        />
      }
      charts={
        <DashboardCharts
          chartData={stats.chartData}
          totalIncome={stats.totalIncome}
          totalExpense={stats.totalOutcome}
        />
      }
      table={
        <TransactionTable
          movements={data?.movements || []}
          isLoading={isLoading}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          dateRange={dateRange}
          setDateRange={handleDateRangeChange}
          title='Global Transactions'
          showUser={true}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={data?.pagination?.total || 0}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          totalBalance={stats.balance}
          onExport={() =>
            handleExport({
              searchQuery,
              dateRange,
              global: true,
              filenamePrefix: 'admin_global_report',
            })
          }
        />
      }
    />
  );
}
