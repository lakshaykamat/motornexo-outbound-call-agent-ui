"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { useAgentConfig } from "@/hooks/queries";
import type { AgentConfig } from "@/lib/api/types";

const DAY_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 break-all font-mono text-xs tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}

function HeroCard({ a }: { a: AgentConfig }) {
  return (
    <Card>
      <CardHeader>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Outbound voice agent
        </span>
        <CardTitle className="text-2xl tracking-tight">
          {a.agent.name}
        </CardTitle>
        <CardAction>
          <Badge
            variant={a.enabled ? "default" : "secondary"}
            className="shrink-0"
          >
            {a.enabled ? "Live" : "Paused"}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          {a.objective}
        </p>
      </CardContent>
    </Card>
  );
}

function IdentityCard({ a }: { a: AgentConfig }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Field label="From number" value={a.agent.fromNumber || "—"} />
          <Field label="Retell agent" value={a.agent.retellAgentId || "—"} />
          <Field label="Retell LLM" value={a.agent.retellLlmId || "—"} />
          <Field
            label="Knowledge base"
            value={a.agent.retellKnowledgeBaseId ?? "—"}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function ScheduleCard({ a }: { a: AgentConfig }) {
  const tz = a.businessHours.timezone || "—";
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
        <CardDescription className="font-mono">{tz}</CardDescription>
      </CardHeader>
      <CardContent>
        {a.businessHours.is24x7 ? (
          <p className="text-sm">
            <span className="font-mono text-base">24 / 7</span>{" "}
            <span className="text-muted-foreground">— always on</span>
          </p>
        ) : a.businessHours.schedule.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No schedule configured.
          </p>
        ) : (
          <ul className="divide-y">
            {a.businessHours.schedule.map((w, i) => (
              <li
                key={i}
                className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0"
              >
                <div className="flex flex-wrap gap-1.5">
                  {w.days.map((d) => (
                    <Badge key={d} variant="secondary">
                      {DAY_LABELS[d] ?? d}
                    </Badge>
                  ))}
                </div>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {w.open}–{w.close}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function PipelineCard({ a }: { a: AgentConfig }) {
  const sm = a.stageMapping;
  const stages: { label: string; id: string | null }[] = [
    { label: "New", id: sm.newStageId },
    { label: "Appointment scheduled", id: sm.onAppointmentScheduledStageId },
    { label: "Follow-up", id: sm.onFollowUpStageId },
    { label: "No answer", id: sm.onNoAnswerStageId },
    { label: "Closed lost", id: sm.onClosedLostStageId },
    { label: "Invalid contact", id: sm.onInvalidContactStageId },
    { label: "Do not contact", id: sm.onDoNotContactStageId },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>CRM pipeline</CardTitle>
        <CardDescription>
          {a.crmProvider}
          {sm.pipelineId ? (
            <>
              {" · "}
              <span className="font-mono">{sm.pipelineId}</span>
            </>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {stages.map((s, i) => (
            <li
              key={s.label + i}
              className="flex items-baseline justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
            >
              <span>{s.label}</span>
              <span className="break-all text-right font-mono text-xs tabular-nums text-muted-foreground">
                {s.id ?? "—"}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function AgentPage() {
  const agent = useAgentConfig();

  if (agent.isLoading) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (agent.isError || !agent.data) {
    return (
      <div className="px-4 lg:px-6">
        <ErrorCard
          message="Agent configuration unavailable."
          detail={
            agent.error instanceof Error ? agent.error.message : undefined
          }
        />
      </div>
    );
  }
  const a = agent.data;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <HeroCard a={a} />
        <div className="flex flex-col gap-4">
          <IdentityCard a={a} />
          <ScheduleCard a={a} />
        </div>
      </div>
      <PipelineCard a={a} />
    </div>
  );
}
