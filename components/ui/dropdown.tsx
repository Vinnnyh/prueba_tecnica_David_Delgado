import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  position?: 'top' | 'bottom';
}

export function Dropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select option", 
  className,
  disabled = false,
  position = 'bottom'
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("relative min-w-[140px]", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full bg-brand-card border border-white/10 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all outline-none focus:border-brand-accent/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown size={16} className={cn("text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[120]" 
            onClick={() => setIsOpen(false)} 
          />
          <div className={cn(
            "absolute left-0 w-full max-h-[250px] overflow-y-auto bg-brand-card border border-white/10 rounded-xl shadow-2xl z-[130] custom-scrollbar animate-in fade-in duration-200",
            position === 'bottom' ? "top-full mt-2 slide-in-from-top-2" : "bottom-full mb-2 slide-in-from-bottom-2"
          )}>
            <div className="p-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-medium",
                    option.value === value
                      ? "bg-brand-accent text-white"
                      : "text-gray-300 hover:bg-brand-accent/20 hover:text-white"
                  )}
                >
                  {option.label}
                </button>
              ))}
              {options.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500 italic">No options available</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
