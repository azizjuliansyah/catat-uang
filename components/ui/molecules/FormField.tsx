import React, { forwardRef } from "react";
import { Label } from "../atoms/Label";
import { Input } from "../atoms/Input";
import { Select } from "../atoms/Select";
import { Textarea } from "../atoms/Textarea";
import { CustomSelect, SelectOption as CustomSelectOption } from "../atoms/CustomSelect";

type FormFieldType = 'text' | 'email' | 'password' | 'currency' | 'number' | 'date' | 'datetime-local' | 'textarea' | 'select' | 'custom-select';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  containerClassName?: string;
  type?: FormFieldType;
  options?: SelectOption[];
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  rows?: number;
  clearable?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      required = false,
      helperText,
      containerClassName = "",
      id,
      disabled,
      type = 'text',
      options = [],
      resize = 'none',
      rows,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const isCurrency = type === "currency";

    // Format utility to Indonesian currency format without prefix
    const formatCurrency = (val: any) => {
      if (val === undefined || val === null) return "";
      const clean = val.toString().replace(/\D/g, "");
      if (!clean) return "";
      return parseInt(clean, 10).toLocaleString("id-ID");
    };

    const displayValue = isCurrency ? formatCurrency(props.value) : props.value;

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!props.onChange) return;
      const rawVal = e.target.value.replace(/\D/g, "");
      const simulatedEvent = {
        ...e,
        target: {
          ...e.target,
          value: rawVal,
          name: props.name || ""
        }
      };
      props.onChange(simulatedEvent as any);
    };

    // Render custom select
    if (type === 'custom-select') {
      return (
        <div className={`flex flex-col w-full font-sans ${containerClassName}`}>
          <Label htmlFor={inputId} required={required} className={disabled ? "opacity-50" : ""}>
            {label}
          </Label>
          <CustomSelect
            options={options as CustomSelectOption[]}
            value={props.value as string}
            onChange={(newValue) => {
              if (props.onChange) {
                const simulatedEvent = {
                  target: {
                    value: newValue,
                    name: props.name || ""
                  }
                };
                props.onChange(simulatedEvent as any);
              }
            }}
            hasError={!!error}
            disabled={disabled}
            placeholder={props.placeholder}
            className={props.className || ""}
            clearable={props.clearable}
            name={props.name}
            required={required}
          />
          {error ? (
            <p className="text-xs text-danger font-medium mt-1.5 flex items-center gap-1.5 animate-fade-in">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
            </p>
          ) : helperText ? (
            <p className="text-xs text-text-muted mt-1.5">{helperText}</p>
          ) : null}
        </div>
      );
    }

    // Render select
    if (type === 'select') {
      return (
        <div className={`flex flex-col w-full font-sans ${containerClassName}`}>
          <Label htmlFor={inputId} required={required} className={disabled ? "opacity-50" : ""}>
            {label}
          </Label>
          <Select
            id={inputId}
            hasError={!!error}
            disabled={disabled}
            value={props.value as string}
            onChange={props.onChange as any}
            className={props.className || ""}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </Select>
          {error ? (
            <p className="text-xs text-danger font-medium mt-1.5 flex items-center gap-1.5 animate-fade-in">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
            </p>
          ) : helperText ? (
            <p className="text-xs text-text-muted mt-1.5">{helperText}</p>
          ) : null}
        </div>
      );
    }

    // Render textarea
    if (type === 'textarea') {
      return (
        <div className={`flex flex-col w-full font-sans ${containerClassName}`}>
          <Label htmlFor={inputId} required={required} className={disabled ? "opacity-50" : ""}>
            {label}
          </Label>
          <Textarea
            id={inputId}
            hasError={!!error}
            disabled={disabled}
            resize={resize}
            rows={rows}
            value={props.value as string}
            onChange={props.onChange as any}
            placeholder={props.placeholder}
            className={props.className || ""}
          />
          {error ? (
            <p className="text-xs text-danger font-medium mt-1.5 flex items-center gap-1.5 animate-fade-in">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
            </p>
          ) : helperText ? (
            <p className="text-xs text-text-muted mt-1.5">{helperText}</p>
          ) : null}
        </div>
      );
    }

    // Render input (default)
    return (
      <div className={`flex flex-col w-full font-sans ${containerClassName}`}>
        <Label htmlFor={inputId} required={required} className={disabled ? "opacity-50" : ""}>
          {label}
        </Label>

        <div className="relative w-full flex items-center">
          {isCurrency && (
            <span className="absolute left-3.5 font-sans text-xs font-bold text-text-secondary select-none">
              Rp.
            </span>
          )}
          <Input
            ref={ref}
            id={inputId}
            hasError={!!error}
            disabled={disabled}
            {...props}
            type={isCurrency ? "text" : type}
            inputMode={isCurrency ? "numeric" : props.inputMode}
            value={displayValue}
            onChange={isCurrency ? handleCurrencyChange : props.onChange}
            className={`${isCurrency ? "!pl-11 font-mono font-bold" : ""} ${props.className || ""}`}
          />
        </div>

        {error ? (
          <p className="text-xs text-danger font-medium mt-1.5 flex items-center gap-1.5 animate-fade-in">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-text-muted mt-1.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = "FormField";
