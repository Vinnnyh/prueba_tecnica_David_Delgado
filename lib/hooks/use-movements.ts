import { useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface UseMovementsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  dateRange?: DateRange;
  global?: boolean;
  all?: boolean;
}

export const useMovements = (options: UseMovementsOptions = {}) => {
  const { 
    page = 1, 
    pageSize = 10, 
    search = '', 
    dateRange, 
    global = false,
    all = false
  } = options;

  return useQuery({
    queryKey: ['movements', { page, pageSize, search, dateRange, global, all }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        global: global.toString(),
        all: all.toString(),
        ...(dateRange?.from && { from: format(dateRange.from, 'yyyy-MM-dd') }),
        ...(dateRange?.to && { to: format(dateRange.to, 'yyyy-MM-dd') }),
      });

      const res = await fetch(`/api/movements?${params}`);
      if (!res.ok) throw new Error('Failed to fetch movements');
      return res.json();
    },
    staleTime: 1000 * 60, // 1 minute
  });
};
