"use client";

import { cn } from "@/lib/utils";

export type SearchFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  compact?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  inputClassName?: string;
};

export function SearchField({
  className,
  inputClassName,
  compact,
  leading,
  trailing,
  disabled,
  ...inputProps
}: SearchFieldProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center rounded-md border border-border bg-white transition-[box-shadow,border-color]",
        "focus-within:border-brand-900 focus-within:ring-2 focus-within:ring-brand-500/35",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      {leading ? (
        <span
          className="flex shrink-0 items-center ps-2 text-muted-foreground"
          aria-hidden
        >
          {leading}
        </span>
      ) : null}
      <input
        type="search"
        disabled={disabled}
        className={cn(
          "min-w-0 flex-1 border-0 bg-transparent text-foreground outline-none ring-0 placeholder:text-muted-foreground/80",
          compact ? "py-1.5 text-xs" : "py-2 text-sm",
          leading ? "ps-1" : "ps-3",
          trailing ? "pe-1" : "pe-3",
          inputClassName,
        )}
        {...inputProps}
      />
      {trailing ? (
        <span
          className="flex shrink-0 items-center pe-2 text-muted-foreground"
          aria-hidden
        >
          {trailing}
        </span>
      ) : null}
    </div>
  );
}
