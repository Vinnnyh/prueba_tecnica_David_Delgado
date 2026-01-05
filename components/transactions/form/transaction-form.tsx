import { useState } from 'react';
import { X } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { LoadingDots } from '@/components/ui/loading-dots';
import { format } from 'date-fns';

interface TransactionFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const TransactionForm = ({ onClose, onSuccess }: TransactionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    concept: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'INCOME' as 'INCOME' | 'EXPENSE'
  });

  const formatAmount = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: `${formData.date}T12:00:00Z`,
          amount: parseFloat(formData.amount.replace(/\./g, ''))
        }),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error creating movement', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-brand-card w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">New Movement</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'INCOME'})}
                className={`py-3 rounded-xl font-bold text-sm transition-all ${
                  formData.type === 'INCOME' ? 'bg-brand-income text-white' : 'bg-white/5 text-gray-500'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                className={`py-3 rounded-xl font-bold text-sm transition-all ${
                  formData.type === 'EXPENSE' ? 'bg-brand-expense text-white' : 'bg-white/5 text-gray-500'
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Concept</label>
            <input
              type="text"
              required
              value={formData.concept}
              onChange={(e) => setFormData({...formData, concept: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent"
              placeholder="e.g. Salary, Rent, Groceries"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Amount</label>
            <input
              type="text"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: formatAmount(e.target.value)})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent"
              placeholder="0"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
            <DatePicker 
              value={formData.date ? new Date(formData.date + 'T12:00:00') : undefined}
              onChange={(date: Date | undefined) => setFormData({...formData, date: date ? format(date, 'yyyy-MM-dd') : ''})}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 bg-brand-accent text-white py-4 rounded-2xl font-bold hover:bg-brand-accent/80 transition-all disabled:opacity-50 min-h-[60px] flex items-center justify-center"
          >
            {isSubmitting ? (
              <LoadingDots className="h-6" dotClassName="bg-white" />
            ) : (
              'Register Movement'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
