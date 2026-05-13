"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { useKnowledgeBase } from "@/hooks/queries";
import type { KnowledgeBase } from "@/lib/api/types";

function Products({ kb }: { kb: KnowledgeBase }) {
  return (
    <section className="space-y-3">
      <header className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Products</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {kb.products.length} entries
        </span>
      </header>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {kb.products.map((p) => (
          <Card key={p.name}>
            <CardHeader>
              <div className="flex items-baseline justify-between gap-2">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <span className="text-xs font-medium text-muted-foreground">
                  {p.price}
                </span>
              </div>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm italic text-muted-foreground">
                “{p.pitch}”
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Objections({ kb }: { kb: KnowledgeBase }) {
  return (
    <section className="space-y-3">
      <header className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Objections</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {kb.objections.length} entries
        </span>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {kb.objections.map((o, i) => (
          <Card key={i}>
            <CardHeader>
              <CardDescription>
                Objection {(i + 1).toString().padStart(2, "0")}
              </CardDescription>
              <CardTitle className="text-base">“{o.objection}”</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{o.response}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function CaseStudies({ kb }: { kb: KnowledgeBase }) {
  return (
    <section className="space-y-3">
      <header className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Case studies</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {kb.caseStudies.length} entries
        </span>
      </header>
      <div className="grid gap-3 md:grid-cols-3">
        {kb.caseStudies.map((c) => (
          <Card key={c.customer}>
            <CardHeader>
              <CardDescription>Customer</CardDescription>
              <CardTitle className="text-base">{c.customer}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{c.outcome}</p>
              <p className="mt-3 text-xs text-muted-foreground">{c.metric}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Faqs({ kb }: { kb: KnowledgeBase }) {
  return (
    <section className="space-y-3">
      <header className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">FAQs</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {kb.faqs.length} entries
        </span>
      </header>
      <Card>
        <CardContent className="divide-y">
          {kb.faqs.map((f, i) => (
            <div key={i} className="py-4 first:pt-0 last:pb-0">
              <p className="text-sm font-medium">{f.question}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function Notes({ kb }: { kb: KnowledgeBase }) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Competitor notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {kb.competitorNotes || "—"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {kb.pricingNotes || "—"}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function Guards({ kb }: { kb: KnowledgeBase }) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Qualifying questions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            {kb.qualifyingQuestions.map((q, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-5 text-muted-foreground tabular-nums">
                  {i + 1}.
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Do not mention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {kb.doNotMention.map((d, i) => (
              <Badge key={i} variant="destructive">
                {d}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default function KnowledgeBasePage() {
  const kb = useKnowledgeBase();

  if (kb.isLoading) {
    return (
      <div className="space-y-3 px-4 lg:px-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }
  if (kb.isError || !kb.data) {
    return (
      <div className="px-4 lg:px-6">
        <ErrorCard
          message="Knowledge base unavailable."
          detail={kb.error instanceof Error ? kb.error.message : undefined}
        />
      </div>
    );
  }
  const data = kb.data;

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <Products kb={data} />
      <Objections kb={data} />
      <CaseStudies kb={data} />
      <Faqs kb={data} />
      <Notes kb={data} />
      <Guards kb={data} />
    </div>
  );
}
