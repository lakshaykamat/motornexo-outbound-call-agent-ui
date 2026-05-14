"use client";

import {
  PhoneCallIcon,
  PhoneIncomingIcon,
  CalendarCheckIcon,
  HourglassIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { useAnalytics } from "@/hooks/queries";
import type { Analytics } from "@/lib/api/types";

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="px-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <span className="text-muted-foreground/70">{icon}</span>
        </div>
        <div className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </div>
        {hint && (
          <div className="mt-1 text-xs text-muted-foreground tabular-nums">
            {hint}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatSkeleton() {
  return (
    <Card>
      <CardContent className="px-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-4 h-7 w-24" />
        <Skeleton className="mt-2 h-3 w-28" />
      </CardContent>
    </Card>
  );
}

const numberFmt = new Intl.NumberFormat("en-US");
const pctFmt = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

function answerRate(a: Analytics) {
  if (!a.totalCalls) return 0;
  return a.answered / a.totalCalls;
}

export function DashboardKpis() {
  const analytics = useAnalytics();

  if (analytics.isError) {
    return (
      <div className="px-4 lg:px-6">
        <ErrorCard
          message="Couldn't load analytics."
          detail={analytics.error instanceof Error ? analytics.error.message : undefined}
        />
      </div>
    );
  }

  if (analytics.isLoading || !analytics.data) {
    return (
      <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    );
  }

  const a = analytics.data;
  const queueHint =
    a.liveNow > 0 ? `${numberFmt.format(a.liveNow)} live now` : "waiting to dial";

  return (
    <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
      <Stat
        label="Total calls"
        value={numberFmt.format(a.totalCalls)}
        hint={`${numberFmt.format(a.answered)} connected`}
        icon={<PhoneCallIcon className="size-4" />}
      />
      <Stat
        label="Queue"
        value={numberFmt.format(a.queued)}
        hint={queueHint}
        icon={<HourglassIcon className="size-4" />}
      />
      <Stat
        label="Connect rate"
        value={pctFmt.format(answerRate(a))}
        hint={`${numberFmt.format(a.answered)} of ${numberFmt.format(a.totalCalls)}`}
        icon={<PhoneIncomingIcon className="size-4" />}
      />
      <Stat
        label="Meetings booked"
        value={numberFmt.format(a.meetingsBooked)}
        hint={pctFmt.format(a.conversionRate) + " conversion"}
        icon={<CalendarCheckIcon className="size-4" />}
      />
    </div>
  );
}

