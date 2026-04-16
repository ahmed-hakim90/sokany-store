"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { inputSurfaceClass } from "@/lib/ui-input";

export type FormFieldProps = {
  label: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  fieldClassName?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> & {
    /** Applies to the outer field wrapper */
    className?: string;
  };

export function FormField({
  label,
  helperText,
  error,
  required,
  fieldClassName,
  id: idProp,
  className,
  ...inputProps
}: FormFieldProps) {
  const uid = useId();
  const id = idProp ?? uid;
  const invalid = Boolean(error);
  const describedBy =
    [helperText ? `${id}-helper` : "", error ? `${id}-error` : ""]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("flex min-w-0 max-w-none flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="text-start text-sm font-medium text-brand-900"
      >
        {label}
        {required ? (
          <span className="ms-0.5 text-red-600" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      <input
        id={id}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={cn(inputSurfaceClass({ invalid }), fieldClassName)}
        {...inputProps}
      />
      {helperText && !error ? (
        <p id={`${id}-helper`} className="text-start text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-start text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
