"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OUTCOME_OPTIONS } from "@/lib/outcomes";
import type { Outcome } from "@/lib/api/types";
import type { CallStatusGroup } from "@/lib/api/xylo";
import { cn } from "@/lib/utils";

export type OutcomeFilter = Outcome | "all";
export type StatusGroupFilter = CallStatusGroup | "all";

export type StatusGroupCounts = Partial<Record<CallStatusGroup, number>> & {
  all?: number;
};

type Tab = { value: StatusGroupFilter; label: string };

const TABS: Tab[] = [
  { value: "all", label: "All" },
  { value: "queued", label: "Queue" },
  { value: "live", label: "Live" },
  { value: "placed", label: "Placed" },
  { value: "failed", label: "Failed" },
];

const numberFmt = new Intl.NumberFormat("en-US");

function formatCount(n: number | undefined) {
  if (n === undefined) return null;
  return numberFmt.format(n);
}

export function CallsFilters({
  statusGroup,
  onStatusGroupChange,
  statusCounts,
  outcome,
  onOutcomeChange,
  onExport,
  exporting,
}: {
  statusGroup: StatusGroupFilter;
  onStatusGroupChange: (value: StatusGroupFilter) => void;
  statusCounts?: StatusGroupCounts;
  outcome: OutcomeFilter;
  onOutcomeChange: (value: OutcomeFilter) => void;
  onExport: () => void;
  exporting: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="-mx-1 flex items-center gap-1 overflow-x-auto px-1"
        role="tablist"
        aria-label="Call status"
      >
        {TABS.map((tab) => {
          const active = tab.value === statusGroup;
          const count = formatCount(statusCounts?.[tab.value]);
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onStatusGroupChange(tab.value)}
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span>{tab.label}</span>
              {count !== null && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    active
                      ? "bg-background/20 text-background"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={outcome}
          onValueChange={(value) => onOutcomeChange(value as OutcomeFilter)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All outcomes</SelectItem>
            {OUTCOME_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button variant="outline" onClick={onExport} disabled={exporting}>
            {exporting ? "Preparing…" : "Export CSV"}
          </Button>
        </div>
      </div>
    </div>
  );
}
