import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X, ChevronDown } from "lucide-react";
import { DayPicker, DropdownProps } from "react-day-picker";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

function CustomDropdown({ value, onChange, options, ...props }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options?.find((opt) => opt.value.toString() === value?.toString());

  return (
    <div className="relative flex-1 min-w-[110px]">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between px-3"
        rightIcon={<ChevronDown size={14} className={cn("text-gray-400 transition-transform", isOpen && "rotate-180")} />}
      >
        <span className="truncate">{selectedOption?.label || value}</span>
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[120]" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full mt-2 left-0 w-full max-h-[250px] overflow-y-auto bg-brand-card border border-white/10 rounded-xl shadow-2xl z-[130] custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-1">
              {options?.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (onChange) {
                      const event = {
                        target: { value: option.value.toString() },
                      } as unknown as React.ChangeEvent<HTMLSelectElement>;
                      onChange(event);
                    }
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    option.value.toString() === value?.toString()
                      ? "bg-brand-accent text-white"
                      : "text-gray-300 hover:bg-brand-accent/20 hover:text-white"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function DatePicker({ value, onChange, placeholder = "Pick a date" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState<Date>(value || new Date());
  const [prevValue, setPrevValue] = useState(value);

  // Adjust state during render when prop changes (No useEffect)
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) setMonth(value);
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start px-4 h-12"
        leftIcon={<CalendarIcon size={16} className="text-gray-500" />}
      >
        <span className={value ? "text-white" : "text-gray-500"}>
          {value ? format(value, "PPP") : placeholder}
        </span>
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[90]" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-2 z-[100] bg-brand-card border border-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in duration-200">
            <DayPicker
              mode="single"
              selected={value}
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                onChange(date);
                setIsOpen(false);
              }}
              captionLayout="dropdown"
              startMonth={new Date(2000, 0)}
              endMonth={new Date(2050, 11)}
              hideNavigation
              components={{
                Dropdown: CustomDropdown
              }}
            />
            <div className="flex justify-center mt-4 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  onChange(today);
                  setMonth(today);
                }}
                className="text-[10px] font-bold bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                Ir a Hoy
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
