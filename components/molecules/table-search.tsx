import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/atoms/input';

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const TableSearch = ({ value, onChange }: TableSearchProps) => {
  return (
    <Input 
      placeholder="Search..." 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-48 sm:w-64 h-10 rounded-xl"
      leftIcon={<Search size={18} />}
      rightIcon={value ? (
        <button 
          onClick={() => onChange('')}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      ) : null}
    />
  );
};
