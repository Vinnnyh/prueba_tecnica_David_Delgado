import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, ShieldCheck } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { StatCard } from '@/components/dashboard/stat-card';
import { TransactionTable } from '@/components/shared/transaction-table';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import Papa from 'papaparse';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        global: 'true', // Key difference: fetch global data
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
      console.error('Error fetching admin dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchQuery, dateRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateRange, pageSize]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        global: 'true',
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
      link.setAttribute('download', `admin_global_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV', error);
    }
  };

  const stats = data?.stats || {
    totalIncome: 0,
    totalOutcome: 0,
    balance: 0,
    historicalBalance: 0,
    chartData: []
  };

  return (
    <PermissionGuard permission="users:view">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <ShieldCheck className="text-brand-accent" size={28} />
              Admin Dashboard
            </h2>
            <p className="text-sm text-gray-500">Global overview of all system movements and users</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Global Income" 
            amount={stats.totalIncome.toLocaleString()} 
            icon={ArrowUpRight} 
            color="bg-brand-income/10 text-brand-income" 
          />
          <StatCard 
            title="Global Outcome" 
            amount={stats.totalOutcome.toLocaleString()} 
            icon={ArrowDownLeft} 
            color="bg-brand-expense/10 text-brand-expense" 
          />
          <StatCard 
            title="System Balance" 
            amount={stats.balance.toLocaleString()} 
            icon={TrendingUp} 
            color="bg-brand-purple/10 text-brand-purple" 
          />
          <StatCard 
            title="Total Assets" 
            amount={stats.historicalBalance.toLocaleString()} 
            icon={Wallet} 
            color="bg-brand-accent/10 text-brand-accent" 
          />
        </div>

        <DashboardCharts 
          chartData={stats.chartData} 
          totalIncome={stats.totalIncome} 
          totalExpense={stats.totalOutcome} 
        />

        <TransactionTable 
          movements={data?.movements || []}
          isLoading={isLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dateRange={dateRange}
          setDateRange={setDateRange}
          title="Global Transactions"
          showUser={true}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={data?.pagination?.total || 0}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          totalBalance={stats.balance}
          onExport={handleExport}
        />
      </div>
    </PermissionGuard>
  );
};

export default AdminDashboard;
