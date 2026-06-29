import React from "react";
import { LucideIcon } from "lucide-react";

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
}

export function FAB({
  icon: Icon,
  title,
  className = "",
  type = "button",
  ...props
}: FABProps) {
  return (
    <button
      type={type}
      title={title}
      className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-12 h-12 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-2xl border border-primary/20 shadow-[0_4px_12px_rgba(92,107,192,0.35)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${className}`}
      aria-label={title}
      {...props}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

