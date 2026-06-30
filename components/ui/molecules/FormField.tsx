import React from "react";
import { Label } from "../atoms/Label";
import { ErrorText } from "../atoms/ErrorText";
import { HelperText } from "../atoms/HelperText";

interface FormFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
  htmlFor?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * FormField - Form field wrapper with label, input, and error/helper text
 *
 * A composition component that provides consistent form field layout.
 * Use with any input component (Input, Textarea, Select, CurrencyInput, etc.).
 *
 * @example
 * <FormField label="Email" required error={error} helperText="We'll never spam you">
 *   <Input type="email" value={email} onChange={setEmail} />
 * </FormField>
 *
 * @example
 * <FormField label="Amount" helperText="Enter amount in Rupiah">
 *   <CurrencyInput value={amount} onChange={setAmount} />
 * </FormField>
 */
export function FormField({
  label,
  error,
  helperText,
  required = false,
  containerClassName = "",
  htmlFor,
  disabled = false,
  children,
}: FormFieldProps) {
  // Generate id from label if not provided
  const id = htmlFor || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={`flex flex-col w-full font-sans ${containerClassName}`}>
      <Label htmlFor={id} required={required} className={disabled ? "opacity-50" : ""}>
        {label}
      </Label>

      {/* Clone child and inject id if it's a valid React element */}
      {React.isValidElement(children)
        ? (() => {
            const child = children as React.ReactElement<any>;
            return React.cloneElement(child, {
              id,
              ...(child.props.hasError === undefined && error ? { hasError: true } : {}),
              ...(child.props.disabled === undefined ? { disabled } : {}),
            });
          })()
        : children}

      {error ? <ErrorText>{error}</ErrorText> : helperText ? <HelperText>{helperText}</HelperText> : null}
    </div>
  );
}

FormField.displayName = "FormField";
