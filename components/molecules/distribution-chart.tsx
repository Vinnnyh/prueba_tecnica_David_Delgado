import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface DistributionChartProps {
  totalIncome: number;
  totalExpense: number;
}

export const DistributionChart = ({
  totalIncome,
  totalExpense,
}: DistributionChartProps) => {
  const pieData = [
    { name: 'Income', value: totalIncome, color: 'hsl(var(--brand-income))' },
    {
      name: 'Expense',
      value: totalExpense,
      color: 'hsl(var(--brand-expense))',
    },
  ];

  return (
    <div className='bg-brand-card rounded-3xl border border-white/5 p-8'>
      <h3 className='font-bold flex items-center gap-2 mb-8'>
        <PieChartIcon size={20} className='text-brand-accent' />
        Distribution
      </h3>
      <div className='h-[300px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={pieData}
              cx='50%'
              cy='50%'
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey='value'
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--chart-tooltip-bg)',
                border: '1px solid var(--chart-tooltip-border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-tooltip)',
              }}
              itemStyle={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'var(--white)',
              }}
              formatter={(value: number | string | undefined) =>
                value !== undefined
                  ? new Intl.NumberFormat('de-DE').format(Number(value))
                  : ''
              }
              itemSorter={(item: { name?: string }) =>
                item.name === 'Income' ? -1 : 1
              }
            />
            <Legend verticalAlign='bottom' height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className='mt-4 space-y-4'>
        <div className='flex justify-between items-center p-4 bg-white/5 rounded-2xl'>
          <span className='text-sm text-gray-500'>Total Income</span>
          <span className='font-bold text-brand-income'>
            ${totalIncome.toLocaleString()}
          </span>
        </div>
        <div className='flex justify-between items-center p-4 bg-white/5 rounded-2xl'>
          <span className='text-sm text-gray-500'>Total Expense</span>
          <span className='font-bold text-brand-expense'>
            ${totalExpense.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
