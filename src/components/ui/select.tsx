"use client";

import * as SelectPrimitive from "@radix-ui/react-select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

const EMPTY = "__empty__";

function toInternal(value: string) {
  return value === "" ? EMPTY : value;
}

function toExternal(value: string) {
  return value === EMPTY ? "" : value;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  className = "",
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      value={toInternal(value)}
      onValueChange={(v) => onValueChange(toExternal(v))}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={`flex items-center justify-between border border-gray-200 bg-white px-2 py-1 text-sm focus:outline-none ${className}`}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="ml-1">
          <ChevronDownIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="border border-gray-200 bg-white shadow-sm z-50 max-h-60 overflow-auto"
        >
          <SelectPrimitive.Viewport>
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={toInternal(opt.value)}
                className="px-2 py-1.5 text-sm cursor-pointer outline-none data-[highlighted]:bg-gray-100"
              >
                <SelectPrimitive.ItemText>
                  {opt.label}
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
