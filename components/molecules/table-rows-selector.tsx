import React from 'react';
import { Dropdown } from '@/components/molecules/dropdown';

interface TableRowsSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export const TableRowsSelector = ({
  value,
  onChange,
}: TableRowsSelectorProps) => {
  const options = [5, 10, 20, 50].map((opt) => ({
    value: opt.toString(),
    label: opt.toString(),
  }));

  return (
    <div className='flex items-center gap-3'>
      <span className='text-[10px] text-gray-500 font-bold uppercase tracking-wider'>
        Rows:
      </span>
      <Dropdown
        value={value.toString()}
        onChange={(val: string) => onChange(parseInt(val))}
        options={options}
        position='top'
        className='min-w-[70px]'
      />
    </div>
  );
};
