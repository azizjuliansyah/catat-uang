"use client";

import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItemProps {
  id: string;
  trigger: ReactNode;
  children: ReactNode;
}

interface AccordionProps {
  items: AccordionItemProps[];
  className?: string;
  defaultOpenIndex?: number; // Index of item to be open by default (-1 for all closed)
}

export function Accordion({ items, className, defaultOpenIndex = -1 }: AccordionProps) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          {...item}
          defaultOpen={index === defaultOpenIndex}
        />
      ))}
    </div>
  );
}

function AccordionItem({ id, trigger, children, defaultOpen }: AccordionItemProps & { defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen || false);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-surface-card/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-hover transition-colors"
      >
        {trigger}
        <ChevronDown
          className={`w-4 h-4 text-text-secondary transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 border-t border-border/50">
          {children}
        </div>
      )}
    </div>
  );
}
