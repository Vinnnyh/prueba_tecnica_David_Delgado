import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/molecules/stat-card';

interface StatsGridProps {
  stats: {
    totalIncome: number;
    totalOutcome: number;
    balance: number;
    historicalBalance: number;
  };
  titles?: {
    income?: string;
    outcome?: string;
    balance?: string;
    historical?: string;
  };
}

export const StatsGrid = ({ stats, titles }: StatsGridProps) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      <StatCard
        title={titles?.income || 'Total Income'}
        amount={stats.totalIncome.toLocaleString()}
        icon={ArrowUpRight}
        color='bg-brand-income/10 text-brand-income'
      />
      <StatCard
        title={titles?.outcome || 'Total Outcome'}
        amount={stats.totalOutcome.toLocaleString()}
        icon={ArrowDownLeft}
        color='bg-brand-expense/10 text-brand-expense'
      />
      <StatCard
        title={titles?.balance || 'Balance'}
        amount={stats.balance.toLocaleString()}
        icon={TrendingUp}
        color='bg-brand-purple/10 text-brand-purple'
      />
      <StatCard
        title={titles?.historical || 'My Wallet (Total)'}
        amount={stats.historicalBalance.toLocaleString()}
        icon={Wallet}
        color='bg-brand-accent/10 text-brand-accent'
      />
    </div>
  );
};
