"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { dispatchCall } from "@/lib/api/xylo";
import {
  DispatchCallRequestSchema,
  normalizePhone,
  validatePhone,
  type DispatchCallRequest,
} from "@/lib/api/types";

const EMPTY_FORM: DispatchCallRequest = {
  phone: "",
  prospectName: "",
  company: "",
  context: "",
};

function trimOptional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function DispatchCallDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<DispatchCallRequest>(EMPTY_FORM);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const queryClient = useQueryClient();

  const phoneError = validatePhone(form.phone);
  const showPhoneError = phoneTouched && phoneError !== null;

  const mutation = useMutation({
    mutationFn: dispatchCall,
    onSuccess: (result) => {
      toast.success("Call dispatched", {
        description: `Retell call id: ${result.retellCallId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["xylo", "calls"] });
      queryClient.invalidateQueries({ queryKey: ["xylo", "analytics"] });
      setForm(EMPTY_FORM);
      setPhoneTouched(false);
      setOpen(false);
    },
    onError: (err) => {
      toast.error("Dispatch failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPhoneTouched(true);
    if (phoneError) return;
    const parsed = DispatchCallRequestSchema.safeParse({
      phone: form.phone,
      prospectName: trimOptional(form.prospectName ?? ""),
      company: trimOptional(form.company ?? ""),
      context: trimOptional(form.context ?? ""),
    });
    if (!parsed.success) return;
    mutation.mutate(parsed.data);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setForm(EMPTY_FORM);
          setPhoneTouched(false);
          mutation.reset();
        }
      }}
    >
      <DialogTrigger render={<Button>Dispatch call</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dispatch a test call</DialogTitle>
          <DialogDescription>
            Place an outbound call right now using the configured Xylo agent.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dispatch-phone">Phone (E.164)</Label>
            <Input
              id="dispatch-phone"
              type="tel"
              inputMode="tel"
              placeholder="+14155552671"
              autoComplete="off"
              value={form.phone}
              aria-invalid={showPhoneError || undefined}
              aria-describedby={showPhoneError ? "dispatch-phone-error" : "dispatch-phone-hint"}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              onBlur={() => {
                setPhoneTouched(true);
                setForm((prev) => ({ ...prev, phone: normalizePhone(prev.phone) }));
              }}
              required
            />
            {showPhoneError ? (
              <p id="dispatch-phone-error" className="text-xs text-destructive">
                {phoneError}
              </p>
            ) : (
              <p id="dispatch-phone-hint" className="text-xs text-muted-foreground">
                E.164 format: + country code, then number (7–15 digits total).
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dispatch-name">Prospect name</Label>
            <Input
              id="dispatch-name"
              placeholder="Jane Doe"
              value={form.prospectName ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, prospectName: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dispatch-company">Company</Label>
            <Input
              id="dispatch-company"
              placeholder="Acme Inc"
              value={form.company ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, company: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dispatch-context">Context</Label>
            <textarea
              id="dispatch-context"
              rows={3}
              maxLength={2000}
              placeholder="Anything the agent should know before the call."
              value={form.context ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, context: e.target.value }))
              }
              className={cn(
                "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
                "dark:bg-input/30",
              )}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || phoneError !== null}
            >
              {mutation.isPending ? "Dispatching…" : "Dispatch now"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
