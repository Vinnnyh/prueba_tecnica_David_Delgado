import React from 'react';
import { IncomeExpenseChart } from '@/components/molecules/income-expense-chart';
import { DistributionChart } from '@/components/molecules/distribution-chart';

interface DashboardChartsProps {
  chartData: any[];
  totalIncome: number;
  totalExpense: number;
}

export const DashboardCharts = ({ chartData, totalIncome, totalExpense }: DashboardChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <IncomeExpenseChart data={chartData} />
      <DistributionChart totalIncome={totalIncome} totalExpense={totalExpense} />
    </div>
  );
};
