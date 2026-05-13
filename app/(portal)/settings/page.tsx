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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ErrorCard } from "@/components/ErrorCard";
import { useMembers, useSession } from "@/hooks/queries";
import { useSignOut } from "@/hooks/useAuth";
import type { Member, SessionUser } from "@/lib/api/types";

function initialsFromEmail(email: string) {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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
      <dd className="mt-1.5 break-words font-mono text-xs tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}

const ROLE_VARIANT: Record<Member["role"], "default" | "secondary" | "outline"> = {
  owner: "default",
  admin: "secondary",
  member: "outline",
  viewer: "outline",
};

function AccountCard({
  u,
  onSignOut,
}: {
  u: SessionUser;
  onSignOut: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Account
        </span>
        <CardTitle className="text-2xl tracking-tight break-all">
          {u.email}
        </CardTitle>
        {u.role ? (
          <CardAction>
            <Badge variant={ROLE_VARIANT[u.role]}>{u.role}</Badge>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Field label="User ID" value={u.id} />
          <Field
            label="Credits"
            value={typeof u.credits === "number" ? u.credits : "—"}
          />
        </dl>
        <Button variant="outline" onClick={onSignOut}>
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}

function MembersCard() {
  const members = useMembers();
  if (members.isError)
    return (
      <ErrorCard
        message="Couldn't load team members."
        detail={
          members.error instanceof Error ? members.error.message : undefined
        }
      />
    );
  if (members.isLoading || !members.data) return <Skeleton className="h-72" />;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <CardDescription>
          {members.data.total} {members.data.total === 1 ? "member" : "members"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {members.data.members.map((m) => (
            <li
              key={m._id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <Avatar className="size-9">
                <AvatarFallback>{initialsFromEmail(m.email)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.email}</p>
                <p className="truncate text-xs text-muted-foreground">
                  joined {new Date(m.createdAt).toISOString().slice(0, 10)}
                </p>
              </div>
              <Badge variant={ROLE_VARIANT[m.role]}>{m.role}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function AccountSection() {
  const session = useSession();
  const { signOut } = useSignOut();
  if (session.isError)
    return (
      <ErrorCard
        message="Couldn't load your account."
        detail={
          session.error instanceof Error ? session.error.message : undefined
        }
      />
    );
  if (session.isLoading || !session.data) return <Skeleton className="h-48" />;
  return <AccountCard u={session.data.user} onSignOut={signOut} />;
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <AccountSection />
      <MembersCard />
    </div>
  );
}
