"use client";

import { format } from "date-fns";
import {
  ClockIcon,
  PhoneIcon,
  CalendarIcon,
  Building2Icon,
  XIcon,
} from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ErrorCard } from "@/components/ErrorCard";
import { useCall, useRecording } from "@/hooks/queries";
import type { Analysis, XyloCall } from "@/lib/api/types";
import { formatDuration } from "@/lib/format";
import { outcomeLabel, sentimentLabel } from "@/lib/outcomes";
import { TranscriptList } from "./TranscriptList";

function WritebackBadge({ status }: { status: XyloCall["crmWritebackStatus"] }) {
  if (!status) return null;
  const variant =
    status === "success"
      ? "default"
      : status === "failed" || status === "abandoned"
        ? "destructive"
        : "secondary";
  return <Badge variant={variant}>CRM: {status}</Badge>;
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="text-sm text-foreground tabular-nums truncate">{value}</div>
      </div>
    </div>
  );
}

function CloseButton() {
  return (
    <DrawerClose
      aria-label="Close"
      className="-mr-1.5 -mt-1.5 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <XIcon className="size-4" />
    </DrawerClose>
  );
}

function CallHeader({ call }: { call: XyloCall }) {
  const startedAt = call.startedAt ?? call.createdAt;
  return (
    <DrawerHeader className="gap-4 border-b p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Call detail
        </span>
        <CloseButton />
      </div>

      <div className="space-y-1">
        <DrawerTitle className="text-2xl font-semibold tracking-tight">
          {call.prospectName || "Unknown caller"}
        </DrawerTitle>
        <DrawerDescription className="font-mono text-sm">
          {call.phone}
        </DrawerDescription>
      </div>

      {(call.analysis?.outcome ||
        call.analysis?.sentiment ||
        call.analysis?.score !== undefined ||
        call.crmWritebackStatus) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {call.analysis?.outcome && (
            <Badge>{outcomeLabel(call.analysis.outcome)}</Badge>
          )}
          {call.analysis?.sentiment && (
            <Badge variant="outline">
              {sentimentLabel(call.analysis.sentiment)}
            </Badge>
          )}
          {call.analysis?.score !== undefined && (
            <Badge variant="secondary">
              Score {call.analysis.score}/10
            </Badge>
          )}
          <WritebackBadge status={call.crmWritebackStatus} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
        <MetaItem
          icon={<CalendarIcon className="size-3.5" />}
          label="When"
          value={format(new Date(startedAt), "MMM d, yyyy")}
        />
        <MetaItem
          icon={<ClockIcon className="size-3.5" />}
          label="Time"
          value={format(new Date(startedAt), "HH:mm")}
        />
        <MetaItem
          icon={<ClockIcon className="size-3.5" />}
          label="Duration"
          value={formatDuration(call.durationSec)}
        />
        {call.company ? (
          <MetaItem
            icon={<Building2Icon className="size-3.5" />}
            label="Company"
            value={call.company}
          />
        ) : (
          <MetaItem
            icon={<PhoneIcon className="size-3.5" />}
            label="Phone"
            value={call.phone}
          />
        )}
      </div>
    </DrawerHeader>
  );
}

function RecordingPlayer({ callId }: { callId: string }) {
  const { data, isLoading } = useRecording(callId, true);

  if (isLoading) return <Skeleton className="h-10 w-full" />;
  if (!data) {
    return <p className="text-sm text-muted-foreground">Recording unavailable.</p>;
  }
  return <audio controls src={data} className="w-full" preload="metadata" />;
}

function AnalysisSummary({ analysis }: { analysis: Analysis }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Summary</h3>
      <p className="text-sm leading-relaxed text-foreground/90">
        {analysis.summary || "No summary available."}
      </p>

      {analysis.objectionsRaised.length > 0 && (
        <div>
          <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Objections
          </h4>
          <ul className="flex flex-wrap gap-1.5">
            {analysis.objectionsRaised.map((objection, i) => (
              <li key={i}>
                <Badge variant="outline">{objection}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.followUpAction && (
        <div className="rounded-lg border bg-muted/40 p-3">
          <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Follow-up
          </h4>
          <p className="text-sm">{analysis.followUpAction}</p>
          {analysis.followUpDate && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {format(new Date(analysis.followUpDate), "MMM d, yyyy")}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function DrawerLoading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

function DrawerError({ error }: { error: unknown }) {
  return (
    <div className="p-6">
      <ErrorCard
        message="Couldn't load this call."
        detail={error instanceof Error ? error.message : undefined}
      />
    </div>
  );
}

function DrawerBody({ call }: { call: XyloCall }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-6 p-6">
        {call.recordingUrl && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Recording</h3>
            <div className="rounded-lg border bg-muted/40 p-3">
              <RecordingPlayer callId={call._id} />
            </div>
          </section>
        )}

        {call.analysis && (
          <>
            <Separator />
            <AnalysisSummary analysis={call.analysis} />
          </>
        )}

        <Separator />

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Transcript</h3>
          <TranscriptList lines={call.transcript ?? []} />
        </section>
      </div>
    </div>
  );
}

export function CallDrawer({
  callId,
  open,
  onOpenChange,
}: {
  callId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: call, isLoading, error } = useCall(callId);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="flex h-full flex-col data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:w-[40vw] data-[vaul-drawer-direction=right]:sm:max-w-none">
        {call ? (
          <CallHeader call={call} />
        ) : (
          <DrawerHeader className="gap-3 border-b p-6">
            <div className="flex items-start justify-between gap-3">
              <DrawerTitle>{isLoading ? "Loading…" : "Call"}</DrawerTitle>
              <CloseButton />
            </div>
            <DrawerDescription>&nbsp;</DrawerDescription>
          </DrawerHeader>
        )}

        {isLoading && <DrawerLoading />}
        {error && <DrawerError error={error} />}
        {call && <DrawerBody call={call} />}
      </DrawerContent>
    </Drawer>
  );
}
