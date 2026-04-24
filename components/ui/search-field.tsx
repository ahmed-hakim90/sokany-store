"use client";

import { forwardRef } from "react";
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

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      className,
      inputClassName,
      compact,
      leading,
      trailing,
      disabled,
      type = "search",
      ...inputProps
    },
    ref,
  ) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center rounded-md bg-white transition-[box-shadow,border-color,background-color]",
        "focus-within:ring-1/2 focus-within:ring-zinc-200/50",
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
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "min-w-0 flex-1 border-0 bg-transparent text-foreground outline-none ring-0 placeholder:text-foreground/70",
          compact ? "py-1.5 text-xs" : "py-2 text-sm",
          leading ? "ps-1" : "ps-3",
          trailing ? "pe-1" : "pe-3",
          inputClassName,
        )}
        {...inputProps}
      />
      {trailing ? (
        <span
          className="flex shrink-0 items-center pe-2 text-foreground"
          aria-hidden
        >
          {trailing}
        </span>
      ) : null}
    </div>
  );
  },
);
