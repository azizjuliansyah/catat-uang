import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-xs font-sans ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-text-muted select-none">/</span>}
            {isLast || !item.href ? (
              <span className="font-semibold text-text-primary" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-text-secondary hover:text-text-primary transition-colors duration-150"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
