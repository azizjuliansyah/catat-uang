import React from "react";
import { ActionButton } from "../atoms/ActionButton";

export interface CardAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: "ghost" | "danger" | "success" | "primary";
  disabled?: boolean;
}

interface CardActionsProps {
  actions: CardAction[];
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
  revealOn?: "hover" | "always" | "group-hover";
  className?: string;
}

export function CardActions({
  actions,
  position = "top-right",
  revealOn = "hover",
  className = "",
}: CardActionsProps) {
  const positionClasses = {
    "top-right": "top-3 right-3",
    "bottom-right": "bottom-3 right-3",
    "top-left": "top-3 left-3",
    "bottom-left": "bottom-3 left-3",
  };

  const revealClasses = {
    hover: "opacity-0 hover:opacity-100",
    "group-hover": "opacity-0 group-hover:opacity-100",
    always: "opacity-100",
  };

  const transitionClass = revealOn !== "always" ? "transition-opacity duration-200" : "";

  return (
    <div
      className={`absolute ${positionClasses[position]} flex items-center gap-0.5 shrink-0 ${revealClasses[revealOn]} ${transitionClass} ${className}`}
    >
      {actions.map((action, index) => (
        <ActionButton
          key={index}
          icon={action.icon}
          title={action.label}
          variant={action.variant || "ghost"}
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
          className="!h-7 !w-7"
        />
      ))}
    </div>
  );
}
