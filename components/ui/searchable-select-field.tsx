"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { inputSurfaceClass } from "@/lib/ui-input";

export type SearchableSelectOption = {
  value: string;
  label: string;
};

export type SearchableSelectFieldProps = {
  label: string;
  options: SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  helperText?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  className?: string;
  fieldClassName?: string;
  disabled?: boolean;
};

export function SearchableSelectField({
  label,
  options,
  value,
  onValueChange,
  helperText,
  error,
  required,
  placeholder,
  id: idProp,
  name,
  className,
  fieldClassName,
  disabled,
}: SearchableSelectFieldProps) {
  const uid = useId();
  const id = idProp ?? uid;
  const listboxId = `${id}-listbox`;
  const invalid = Boolean(error);
  const selectedOption = options.find((option) => option.value === value);
  const [queryState, setQueryState] = useState({
    valueAtSync: value,
    query: selectedOption?.label ?? "",
  });
  const [open, setOpen] = useState(false);
  const query =
    queryState.valueAtSync === value
      ? queryState.query
      : selectedOption?.label ?? "";

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => {
      const label = option.label.toLowerCase();
      const optionValue = option.value.toLowerCase();
      return label.includes(normalizedQuery) || optionValue.includes(normalizedQuery);
    });
  }, [options, query]);

  const describedBy =
    [helperText ? `${id}-helper` : "", error ? `${id}-error` : ""]
      .filter(Boolean)
      .join(" ") || undefined;

  const selectValue = (nextValue: string) => {
    const nextOption = options.find((option) => option.value === nextValue);
    onValueChange(nextOption?.value ?? "");
    setQueryState({
      valueAtSync: nextOption?.value ?? "",
      query: nextOption?.label ?? "",
    });
    setOpen(false);
  };

  const selectMatchingQuery = () => {
    const normalizedQuery = query.trim().toLowerCase();
    const match = options.find(
      (option) =>
        option.label.trim().toLowerCase() === normalizedQuery ||
        option.value.trim().toLowerCase() === normalizedQuery,
    );
    if (match) {
      selectValue(match.value);
      return;
    }
    /* لا يوجد تطابق مع ما كتبه المستخدم — أعد عرض التسمية المعتمدة للقيمة الحالية (يشمل value فارغاً + «بدون تحديد»). */
    if (selectedOption) {
      setQueryState({ valueAtSync: value, query: selectedOption.label });
    }
    setOpen(false);
  };

  return (
    <div
      className={cn("relative flex min-w-0 max-w-none flex-col gap-1.5", className)}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (!(nextFocus instanceof Node) || !event.currentTarget.contains(nextFocus)) {
          selectMatchingQuery();
        }
      }}
    >
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
        name={name}
        value={query}
        onChange={(event) => {
          /* لا نستدعي onValueChange هنا — البحث محلي حتى الاختيار من القائمة أو blur؛
           * استدعاء onValueChange("") كان يمسح المحافظة/المدينة في كل حرف */
          setQueryState({ valueAtSync: value, query: event.target.value });
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            return;
          }
          if (event.key === "Enter" && filteredOptions[0]) {
            event.preventDefault();
            selectValue(filteredOptions[0].value);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        aria-controls={listboxId}
        aria-expanded={open}
        aria-autocomplete="list"
        role="combobox"
        autoComplete="off"
        className={cn(inputSurfaceClass({ invalid }), fieldClassName)}
      />
      {open && !disabled ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-56 overflow-auto rounded-md border border-border bg-white py-1 text-sm shadow-lg"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={cn(
                  "block w-full px-3 py-2 text-start text-foreground hover:bg-surface-muted focus:bg-surface-muted focus:outline-none",
                  option.value === value && "bg-surface-muted font-medium",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectValue(option.value)}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-start text-muted-foreground">
              لا توجد نتائج
            </div>
          )}
        </div>
      ) : null}
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
