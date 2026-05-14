"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CallsFilters,
  type OutcomeFilter,
  type StatusGroupCounts,
  type StatusGroupFilter,
} from "@/components/CallsFilters";
import { CallsTable } from "@/components/CallsTable";
import { CallDrawer } from "@/components/CallDrawer";
import { ErrorCard } from "@/components/ErrorCard";
import { useAnalytics, useCalls } from "@/hooks/queries";
import { useExportCalls } from "@/hooks/useExportCalls";
import type { Outcome } from "@/lib/api/types";
import type { CallStatusGroup } from "@/lib/api/xylo";

const PAGE_SIZE = 25;

function toApiOutcome(filter: OutcomeFilter): Outcome | undefined {
  return filter === "all" ? undefined : filter;
}

function toApiStatusGroup(
  filter: StatusGroupFilter,
): CallStatusGroup | undefined {
  return filter === "all" ? undefined : filter;
}

function Pagination({
  page,
  pageCount,
  total,
  disabled,
  onChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  disabled: boolean;
  onChange: (next: number) => void;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 lg:px-6">
      <p className="text-sm text-muted-foreground tabular-nums">
        Page {page} of {pageCount} · {total} calls
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={disabled || page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.min(pageCount, page + 1))}
          disabled={disabled || page >= pageCount}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function CallsPage() {
  const [outcome, setOutcome] = useState<OutcomeFilter>("all");
  const [statusGroup, setStatusGroup] = useState<StatusGroupFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const apiOutcome = toApiOutcome(outcome);
  const apiStatusGroup = toApiStatusGroup(statusGroup);
  const callsQuery = useCalls({
    outcome: apiOutcome,
    statusGroup: apiStatusGroup,
    page,
    limit: PAGE_SIZE,
  });
  const analytics = useAnalytics();
  const { exportCsv, exporting } = useExportCalls();

  const total = callsQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Tab counts come from the analytics endpoint so they stay correct
  // regardless of the current page/outcome filter.
  const statusCounts: StatusGroupCounts | undefined = analytics.data && {
    all: analytics.data.totalCalls + analytics.data.queued,
    queued: analytics.data.queued,
    live: analytics.data.liveNow,
    placed: analytics.data.totalCalls,
    failed: analytics.data.failed,
  };

  return (
    <>
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <CallsFilters
          statusGroup={statusGroup}
          onStatusGroupChange={(next) => {
            setPage(1);
            setStatusGroup(next);
          }}
          statusCounts={statusCounts}
          outcome={outcome}
          onOutcomeChange={(next) => {
            setPage(1);
            setOutcome(next);
          }}
          onExport={() =>
            exportCsv({ outcome: apiOutcome, statusGroup: apiStatusGroup })
          }
          exporting={exporting}
        />

        {callsQuery.isError ? (
          <ErrorCard
            message="Couldn't load calls."
            detail={callsQuery.error instanceof Error ? callsQuery.error.message : undefined}
          />
        ) : (
          <CallsTable
            calls={callsQuery.data?.calls ?? []}
            isLoading={callsQuery.isLoading}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        total={total}
        disabled={callsQuery.isFetching}
        onChange={setPage}
      />

      <CallDrawer
        callId={selectedId}
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </>
  );
}
