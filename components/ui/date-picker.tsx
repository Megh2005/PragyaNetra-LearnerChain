"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css"; // Import the default styles

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  disabled,
  className,
  placeholder = "Pick a date",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd-MM-yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-black border-cyan-400/30 text-white">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          disabled={disabled}
          formatters={{
            formatCaption: (month, options) => (
              <div className="flex justify-center py-2">
                {format(month, "MMMM yyyy", options)}
              </div>
            ),
          }}
          styles={{
            caption: { display: "none" }, // Hide default caption as we're using a custom one
            head_cell: { color: "var(--cyan-400)" },
            day_selected: { backgroundColor: "var(--cyan-400)", color: "black" },
            day_today: { fontWeight: "bold", color: "var(--cyan-400)" },
            day_disabled: { color: "var(--gray-500)" },
            nav_button_previous: { color: "var(--cyan-400)" },
            nav_button_next: { color: "var(--cyan-400)" },
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
