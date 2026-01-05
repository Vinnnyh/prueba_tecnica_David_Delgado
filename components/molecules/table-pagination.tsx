import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/utils';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const TablePagination = ({ currentPage, totalPages, onPageChange }: TablePaginationProps) => {
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-9 h-9"
      >
        <ChevronLeft size={18} />
      </Button>
      
      <div className="flex items-center gap-1">
        {pages.map((pageNum) => (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? 'primary' : 'ghost'}
            onClick={() => onPageChange(pageNum)}
            className={cn(
              "w-8 h-8 p-0 text-xs",
              currentPage !== pageNum && "text-gray-500"
            )}
          >
            {pageNum}
          </Button>
        ))}
      </div>

      <Button
        variant="secondary"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-9 h-9"
      >
        <ChevronRight size={18} />
      </Button>
    </div>
  );
};
