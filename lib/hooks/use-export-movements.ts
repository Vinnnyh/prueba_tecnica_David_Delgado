import Papa from 'papaparse';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface ExportOptions {
  searchQuery?: string;
  dateRange?: DateRange;
  global?: boolean;
  filenamePrefix?: string;
}

export function useExportMovements() {
  const handleExport = async (options: ExportOptions = {}) => {
    const { searchQuery, dateRange, global, filenamePrefix = 'movements_report' } = options;
    
    try {
      const params = new URLSearchParams({
        all: 'true',
        ...(global && { global: 'true' }),
        ...(searchQuery && { search: searchQuery }),
        ...(dateRange?.from && { from: format(dateRange.from, 'yyyy-MM-dd') }),
        ...(dateRange?.to && { to: format(dateRange.to, 'yyyy-MM-dd') }),
      });

      const res = await fetch(`/api/movements?${params}`);
      const result = await res.json();
      
      const csvData = result.movements.map((m: any) => ({
        ID: m.id,
        Concept: m.concept,
        Amount: m.amount,
        Type: m.type,
        Date: new Date(m.date).toLocaleDateString('en-US'),
        User: m.user?.name || 'N/A'
      }));
      
      const csv = Papa.unparse(csvData);
      // Add BOM and sep=, for Excel compatibility
      const csvContent = `sep=,\r\n${csv}`;
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filenamePrefix}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV', error);
    }
  };

  return { handleExport };
}
