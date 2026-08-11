import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-divider py-14 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-track text-text-muted">
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-heading text-sm font-bold text-text">{title}</p>
        {description && <p className="text-[13px] text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
