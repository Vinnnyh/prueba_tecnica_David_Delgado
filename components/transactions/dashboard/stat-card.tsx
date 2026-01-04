import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: string | number;
  trend?: string;
  icon: LucideIcon;
  color: string;
  isCurrency?: boolean;
}

export const StatCard = ({ title, amount, trend, icon: Icon, color, isCurrency = true }: StatCardProps) => (
  <div className="bg-brand-card p-6 rounded-3xl border border-white/5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${color}`}>
      <Icon size={24} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-gray-500 text-sm font-medium truncate">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold truncate">{isCurrency ? '$' : ''}{amount}</p>
        {trend && (
          <span className="text-green-500 text-[10px] font-bold bg-green-500/10 px-1.5 py-0.5 rounded-md">
            {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);
