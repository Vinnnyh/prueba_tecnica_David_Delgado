import React from 'react';

interface TableSummaryProps {
  label: string;
  amount: number;
}

export const TableSummary = ({ label, amount }: TableSummaryProps) => {
  return (
    <div className='flex flex-col items-end'>
      <span className='text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1'>
        {label}
      </span>
      <span
        className={`text-xl font-black ${amount >= 0 ? 'text-brand-income' : 'text-brand-expense'}`}
      >
        {amount < 0 ? '-' : ''}${Math.abs(amount).toLocaleString()}
      </span>
    </div>
  );
};
