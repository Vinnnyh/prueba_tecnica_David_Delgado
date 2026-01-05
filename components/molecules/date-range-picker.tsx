import * as React from "react";
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, subDays, subMonths, subYears } from "date-fns";
import { Calendar as CalendarIcon, X, ChevronDown } from "lucide-react";
import { DateRange, DayPicker, DropdownProps } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "@/lib/utils";
import { Dropdown } from "./dropdown";
import { Button } from "@/components/atoms/button";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

function CustomDropdown({ value, onChange, options, ...props }: DropdownProps) {
  const dropdownOptions = options?.map(opt => ({ 
    value: opt.value.toString(), 
    label: opt.label 
  })) || [];

  return (
    <Dropdown
      value={value?.toString() || ''}
      options={dropdownOptions}
      onChange={(val: string) => {
        if (onChange) {
          const event = {
            target: { value: val },
          } as unknown as React.ChangeEvent<HTMLSelectElement>;
          onChange(event);
        }
      }}
      className="flex-1 min-w-[110px]"
    />
  );
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(value?.from || new Date());
  const [prevValueFrom, setPrevValueFrom] = React.useState(value?.from);

  if (value?.from !== prevValueFrom) {
    setPrevValueFrom(value?.from);
    if (value?.from) setMonth(value.from);
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 gap-3 hover:bg-white/[0.08] transition-all cursor-pointer min-w-[240px]"
      >
        <CalendarIcon size={16} className="text-gray-500" />
        <div className="flex-1 text-sm">
          {value?.from ? (
            value.to ? (
              <span className="text-gray-200">
                {format(value.from, "LLL dd, y")} - {format(value.to, "LLL dd, y")}
              </span>
            ) : (
              <span className="text-gray-200">{format(value.from, "LLL dd, y")}</span>
            )
          ) : (
            <span className="text-gray-500 font-medium">Select date range</span>
          )}
        </div>
        {value?.from && (
          <Button 
            variant="ghost"
            size="icon"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onChange(undefined);
            }}
            className="w-6 h-6 p-0 text-gray-500 hover:text-white"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[40]" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full mt-2 right-0 z-50 bg-brand-card border border-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in duration-200 origin-top-right">
            <DayPicker
              mode="range"
              month={month}
              onMonthChange={setMonth}
              selected={value}
              onSelect={onChange}
              numberOfMonths={1}
              captionLayout="dropdown"
              startMonth={new Date(2000, 0)}
              endMonth={new Date(2050, 11)}
              hideNavigation
              components={{
                Dropdown: CustomDropdown
              }}
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 gap-2">
              <div className="flex flex-wrap gap-1.5 flex-1">
                {[
                  { label: 'Today', range: { from: startOfDay(new Date()), to: endOfDay(new Date()) } },
                  { label: '7D', range: { from: subDays(new Date(), 7), to: new Date() } },
                  { label: '30D', range: { from: subMonths(new Date(), 1), to: new Date() } },
                  { label: '1Y', range: { from: subYears(new Date(), 1), to: new Date() } },
                  { label: 'All', range: undefined },
                ].map((preset) => {
                  const isActive = (!value && !preset.range) || 
                    (value?.from?.toDateString() === preset.range?.from?.toDateString() && 
                     value?.to?.toDateString() === preset.range?.to?.toDateString());

                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        onChange(preset.range);
                        if (preset.range?.from) setMonth(preset.range.from);
                      }}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all",
                        isActive 
                          ? "bg-brand-accent text-white shadow-md shadow-brand-accent/20" 
                          : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-brand-accent text-white px-5 py-2 rounded-xl text-[11px] font-bold hover:bg-brand-accent/80 transition-all shadow-lg shadow-brand-accent/20 shrink-0"
              >
                Aplicar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
