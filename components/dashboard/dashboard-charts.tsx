import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface DashboardChartsProps {
  chartData: any[];
  totalIncome: number;
  totalExpense: number;
}

export const DashboardCharts = ({ chartData, totalIncome, totalExpense }: DashboardChartsProps) => {
  const pieData = [
    { name: 'Income', value: totalIncome, color: 'hsl(var(--brand-income))' },
    { name: 'Expense', value: totalExpense, color: 'hsl(var(--brand-expense))' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Chart */}
      <div className="lg:col-span-2 bg-brand-card rounded-3xl border border-white/5 p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold flex items-center gap-2">
            <BarChart3 size={20} className="text-brand-accent" />
            Income vs Expenses
          </h3>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="var(--chart-text)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="var(--chart-text)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `$${new Intl.NumberFormat('de-DE').format(value)}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--chart-tooltip-bg)', 
                  border: '1px solid var(--chart-tooltip-border)', 
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-tooltip)'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--white)' }}
                labelStyle={{ color: 'var(--chart-text)', fontWeight: 'bold', marginBottom: '4px' }}
                cursor={{ fill: 'var(--chart-cursor)' }}
                formatter={(value: any) => new Intl.NumberFormat('de-DE').format(Number(value))}
                itemSorter={(item: any) => (item.name === 'Income' ? -1 : 1)}
              />
              <Bar dataKey="income" fill="hsl(var(--brand-income))" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="hsl(var(--brand-expense))" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-brand-card rounded-3xl border border-white/5 p-8">
        <h3 className="font-bold flex items-center gap-2 mb-8">
          <PieChartIcon size={20} className="text-brand-accent" />
          Distribution
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--chart-tooltip-bg)', 
                  border: '1px solid var(--chart-tooltip-border)', 
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-tooltip)'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--white)' }}
                formatter={(value: any) => new Intl.NumberFormat('de-DE').format(Number(value))}
                itemSorter={(item: any) => (item.name === 'Income' ? -1 : 1)}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
            <span className="text-sm text-gray-500">Total Income</span>
            <span className="font-bold text-brand-income">${totalIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
            <span className="text-sm text-gray-500">Total Expense</span>
            <span className="font-bold text-brand-expense">${totalExpense.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
