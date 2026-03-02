"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Shield, User, ArrowRight, Building2 } from "lucide-react";

interface Invite {
  id: string;
  code: string;
  role: "admin" | "member";
  expiresAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
}

type InviteState =
  | { status: "loading" }
  | { status: "loaded"; invite: Invite }
  | { status: "accepting" }
  | { status: "success"; orgSlug: string }
  | { status: "error"; error: string; code?: number };

export default function InvitePage() {
  const params = useParams();
  const code = params.code as string;
  const [state, setState] = useState<InviteState>({ status: "loading" });

  const fetchInvite = useCallback(async () => {
    try {
      const response = await fetch(`/api/invites/${code}`);

      if (!response.ok) {
        if (response.status === 404) {
          setState({ status: "error", error: "Invalid invitation code", code: 404 });
          return;
        }
        if (response.status === 410) {
          setState({ status: "error", error: "This invitation has expired", code: 410 });
          return;
        }
        throw new Error("Failed to fetch invitation");
      }

      const data = await response.json();
      setState({ status: "loaded", invite: data.invite });
    } catch {
      setState({ status: "error", error: "Failed to load invitation" });
    }
  }, [code]);

  useEffect(() => {
    fetchInvite();
  }, [fetchInvite]);

  const handleAccept = async () => {
    setState((prev) => ({ ...prev, status: "accepting" }));

    try {
      const response = await fetch(`/api/invites/${code}/accept`, {
        method: "POST",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setState({
            status: "error",
            error: "Please sign in to accept this invitation",
            code: 401,
          });
          return;
        }
        if (response.status === 409) {
          setState({
            status: "error",
            error: "You are already a member of this organization",
            code: 409,
          });
          return;
        }
        if (response.status === 410) {
          setState({ status: "error", error: "This invitation has expired", code: 410 });
          return;
        }
        throw new Error("Failed to accept invitation");
      }

      const data = await response.json();
      setState({ status: "success", orgSlug: data.organization.slug });
    } catch {
      setState({ status: "error", error: "Failed to accept invitation" });
    }
  };

  function getRoleIcon(role: string) {
    switch (role) {
      case "admin":
        return <Shield className="h-5 w-5 text-foreground" />;
      default:
        return <User className="h-5 w-5 text-muted-foreground" />;
    }
  }

  function getRoleBadgeClasses(role: string) {
    switch (role) {
      case "admin":
        return "border-foreground text-foreground";
      default:
        return "border-border text-muted-foreground";
    }
  }

  // Loading state
  if (state.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-accent mx-auto mb-4" />
          <p className="font-body text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md border border-border bg-white p-8 text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-6" />
          <h1 className="font-serif text-2xl text-foreground mb-2">Invitation Error</h1>
          <p className="font-body text-muted-foreground mb-8">{state.error}</p>
          <div className="flex flex-col gap-3">
            {state.code === 401 && (
              <Button
                asChild
                className="font-body tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary-hover rounded-none"
              >
                <Link href={`/auth/signin?callbackUrl=/invite/${code}`}>Sign In</Link>
              </Button>
            )}
            {state.code === 409 && (
              <Button
                asChild
                className="font-body tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary-hover rounded-none"
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
            <Button
              variant="outline"
              asChild
              className="font-body tracking-wider uppercase border-border text-foreground hover:bg-secondary rounded-none"
            >
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Accepting state
  if (state.status === "accepting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-accent mx-auto mb-4" />
          <p className="font-body text-muted-foreground">Accepting invitation...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (state.status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md border border-border bg-white p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-6" />
          <h1 className="font-serif text-2xl text-foreground mb-2">Welcome</h1>
          <p className="font-body text-muted-foreground mb-8">
            You have successfully joined the organization.
          </p>
          <Button
            asChild
            className="font-body tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary-hover rounded-none"
          >
            <Link href={`/dashboard/orgs/${state.orgSlug}`}>
              Go to Organization
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Loaded state - show invite details
  const { invite } = state;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md border border-border bg-white p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-6 bg-accent"></div>
            <span className="font-body text-xs tracking-[0.2em] uppercase text-accent">
              Invitation
            </span>
            <div className="h-px w-6 bg-accent"></div>
          </div>
          <h1 className="font-serif text-2xl text-foreground mb-2">Join Organization</h1>
          <p className="font-body text-muted-foreground">You have been invited to contribute to</p>
        </div>

        {/* Organization Card */}
        <div className="border border-border bg-background p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center border border-border bg-white">
              <Building2 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-foreground">{invite.organization.name}</h2>
              <p className="font-body text-sm text-muted-foreground">/{invite.organization.slug}</p>
            </div>
          </div>
        </div>

        {/* Role Info */}
        <div className="flex items-center justify-between p-4 border border-border mb-8">
          <div className="flex items-center gap-3">
            {getRoleIcon(invite.role)}
            <div>
              <p className="font-body text-sm text-muted-foreground">You will join as</p>
              <p className="font-serif text-foreground capitalize">{invite.role}</p>
            </div>
          </div>
          <span
            className={`text-xs font-body tracking-wider uppercase px-2 py-1 border ${getRoleBadgeClasses(invite.role)}`}
          >
            {invite.role}
          </span>
        </div>

        {/* Creator Info */}
        <div className="mb-8 text-center">
          <p className="font-body text-sm text-muted-foreground">
            Invited by{" "}
            <span className="text-foreground">
              {invite.creator?.name || invite.creator?.email || "Unknown"}
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleAccept}
            className="w-full font-body tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary-hover rounded-none"
          >
            Accept Invitation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-full font-body tracking-wider uppercase border-border text-foreground hover:bg-secondary rounded-none"
          >
            <Link href="/">Decline</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
