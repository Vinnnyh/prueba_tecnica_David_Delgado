import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface ChartData {
  name: string;
  income: number;
  expense: number;
}

interface IncomeExpenseChartProps {
  data: ChartData[];
}

export const IncomeExpenseChart = ({ data }: IncomeExpenseChartProps) => (
  <div className='lg:col-span-2 bg-brand-card rounded-3xl border border-white/5 p-8'>
    <div className='flex items-center justify-between mb-8'>
      <h3 className='font-bold flex items-center gap-2'>
        <BarChart3 size={20} className='text-brand-accent' />
        Income vs Expenses
      </h3>
    </div>
    <div className='h-[400px] w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray='3 3'
            stroke='var(--chart-grid)'
            vertical={false}
          />
          <XAxis
            dataKey='name'
            stroke='var(--chart-text)'
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke='var(--chart-text)'
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              `$${new Intl.NumberFormat('de-DE').format(value)}`
            }
          />
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
            labelStyle={{
              color: 'var(--chart-text)',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
            cursor={{ fill: 'var(--chart-cursor)' }}
            formatter={(value: number | string | undefined) =>
              value !== undefined
                ? new Intl.NumberFormat('de-DE').format(Number(value))
                : ''
            }
            itemSorter={(item: { name?: string }) =>
              item.name === 'Income' ? -1 : 1
            }
          />
          <Bar
            dataKey='income'
            fill='hsl(var(--brand-income))'
            radius={[4, 4, 0, 0]}
            name='Income'
          />
          <Bar
            dataKey='expense'
            fill='hsl(var(--brand-expense))'
            radius={[4, 4, 0, 0]}
            name='Expense'
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);
