import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required = false, children, className = "", ...props }: LabelProps) {
  return (
    <label
      className={`block text-xs font-semibold text-text-secondary mb-1.5 font-sans ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-danger ml-1 font-bold">*</span>}
    </label>
  );
}
