"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Crown,
  Shield,
  User,
  Plus,
  Copy,
  Trash2,
  Loader2,
  Users,
  Key,
  Clock,
} from "lucide-react";

interface Member {
  id: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
}

interface Invite {
  id: string;
  code: string;
  role: "admin" | "member";
  createdAt: string;
  expiresAt: string | null;
  maxUses: number | null;
  useCount: number;
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface OrgData {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "member";
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "--";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRoleIcon(role: string) {
  switch (role) {
    case "owner":
      return <Crown className="h-4 w-4 text-accent" />;
    case "admin":
      return <Shield className="h-4 w-4 text-foreground" />;
    default:
      return <User className="h-4 w-4 text-muted-foreground" />;
  }
}

function getRoleBadgeClasses(role: string) {
  switch (role) {
    case "owner":
      return "border-accent text-accent";
    case "admin":
      return "border-foreground text-foreground";
    default:
      return "border-border text-muted-foreground";
  }
}

export default function MembersPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [org, setOrg] = useState<OrgData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [createInviteOpen, setCreateInviteOpen] = useState(false);
  const [deleteMemberOpen, setDeleteMemberOpen] = useState(false);
  const [deleteInviteOpen, setDeleteInviteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [expiresInHours, setExpiresInHours] = useState<string>("");
  const [maxUses, setMaxUses] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [orgRes, membersRes, invitesRes] = await Promise.all([
        fetch(`/api/orgs/${slug}`),
        fetch(`/api/orgs/${slug}/members`),
        fetch(`/api/orgs/${slug}/invites`),
      ]);

      if (!orgRes.ok) {
        if (orgRes.status === 404) {
          router.push("/dashboard/orgs");
          return;
        }
        throw new Error("Failed to fetch organization");
      }

      const orgData = await orgRes.json();
      setOrg(orgData.organization);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members);
      }

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInvites(invitesData.invites);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const body: {
        role: string;
        expiresInHours?: number;
        maxUses?: number;
      } = { role: inviteRole };

      if (expiresInHours) {
        body.expiresInHours = parseInt(expiresInHours);
      }
      if (maxUses) {
        body.maxUses = parseInt(maxUses);
      }

      const response = await fetch(`/api/orgs/${slug}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create invite");
      }

      const data = await response.json();
      setInvites([data.invite, ...invites]);
      setCreateInviteOpen(false);
      setInviteRole("member");
      setExpiresInHours("");
      setMaxUses("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invite");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/orgs/${slug}/members/${selectedMember.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove member");
      }

      setMembers(members.filter((m) => m.id !== selectedMember.id));
      setDeleteMemberOpen(false);
      setSelectedMember(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteInvite = async () => {
    if (!selectedInvite) return;
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/orgs/${slug}/invites/${selectedInvite.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to revoke invite");
      }

      setInvites(invites.filter((i) => i.id !== selectedInvite.id));
      setDeleteInviteOpen(false);
      setSelectedInvite(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke invite");
    } finally {
      setDeleting(false);
    }
  };

  const copyInviteCode = (code: string) => {
    const inviteUrl = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const canManageMembers = org?.role === "owner" || org?.role === "admin";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-muted-foreground">Organization not found</p>
        <Button
          asChild
          className="mt-4 font-body tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary-hover rounded-none"
        >
          <Link href="/dashboard/orgs">Return to Organizations</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Breadcrumb & Header */}
      <div className="border-b border-border pb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4 font-body text-muted-foreground hover:bg-secondary hover:text-foreground -ml-4"
        >
          <Link href={`/dashboard/orgs/${slug}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Collection
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-6 bg-accent"></div>
              <span className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                Contributors
              </span>
            </div>
            <h1 className="font-serif text-3xl text-foreground">Members</h1>
            <p className="mt-2 font-body text-muted-foreground">
              Manage access and invitations for {org.name}
            </p>
          </div>
          {canManageMembers && (
            <Button
              onClick={() => setCreateInviteOpen(true)}
              className="font-body tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary-hover border-0 rounded-none"
            >
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="border-l-2 border-destructive bg-destructive/5 p-4">
          <p className="font-body text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Members Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-px w-4 bg-accent"></div>
            <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
              Active Members
            </span>
          </div>
          <span className="font-body text-sm text-muted-foreground">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="border border-border bg-white">
          {members.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-10 w-10 text-accent mx-auto mb-4" />
              <h3 className="font-serif text-lg text-foreground">No members yet</h3>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                Invite contributors to join this organization.
              </p>
            </div>
          ) : (
            members.map((member, index) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-6 ${index !== members.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center border border-border bg-background">
                    <span className="font-serif text-lg text-foreground">
                      {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-serif text-foreground">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="font-body text-sm text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-body text-sm text-muted-foreground">
                    Joined {formatDate(member.joinedAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    <span
                      className={`text-xs font-body tracking-wider uppercase px-2 py-1 border ${getRoleBadgeClasses(member.role)}`}
                    >
                      {member.role}
                    </span>
                  </div>
                  {canManageMembers && member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedMember(member);
                        setDeleteMemberOpen(true);
                      }}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invites Section */}
      {canManageMembers && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-px w-4 bg-accent"></div>
              <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
                Active Invitations
              </span>
            </div>
            <span className="font-body text-sm text-muted-foreground">
              {invites.length} pending
            </span>
          </div>

          <div className="border border-border bg-white">
            {invites.length === 0 ? (
              <div className="p-8 text-center">
                <Key className="h-10 w-10 text-accent mx-auto mb-4" />
                <h3 className="font-serif text-lg text-foreground">No active invites</h3>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  Create an invitation to add new members.
                </p>
              </div>
            ) : (
              invites.map((invite, index) => (
                <div
                  key={invite.id}
                  className={`flex items-center justify-between p-6 ${index !== invites.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center border border-border bg-background">
                      <Key className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-foreground">Invite Code</span>
                        <span
                          className={`text-xs font-body tracking-wider uppercase px-2 py-1 border ${getRoleBadgeClasses(invite.role)}`}
                        >
                          {invite.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-body text-sm text-muted-foreground">
                        <span>Created {formatDate(invite.createdAt)}</span>
                        {invite.expiresAt && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires {formatDate(invite.expiresAt)}
                            </span>
                          </>
                        )}
                        {invite.maxUses && (
                          <>
                            <span>•</span>
                            <span>
                              {invite.useCount} / {invite.maxUses} uses
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInviteCode(invite.code)}
                      className="font-body text-xs tracking-wider uppercase border-border hover:border-foreground hover:bg-secondary rounded-none"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      {copiedCode === invite.code ? "Copied" : "Copy Link"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedInvite(invite);
                        setDeleteInviteOpen(true);
                      }}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Invite Dialog */}
      <Dialog open={createInviteOpen} onOpenChange={setCreateInviteOpen}>
        <DialogContent className="bg-white border-border rounded-none max-w-lg">
          <form onSubmit={handleCreateInvite}>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-foreground">
                Invite Member
              </DialogTitle>
              <DialogDescription className="font-body text-muted-foreground">
                Create an invitation link to add a new contributor.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label
                  htmlFor="role"
                  className="font-body text-xs tracking-wider uppercase text-muted-foreground"
                >
                  Role
                </Label>
                <Select
                  value={inviteRole}
                  onValueChange={(v) => setInviteRole(v as "member" | "admin")}
                >
                  <SelectTrigger className="font-body border-border rounded-none focus:border-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border rounded-none">
                    <SelectItem value="member" className="font-body">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Member — Can create and manage links
                      </div>
                    </SelectItem>
                    <SelectItem value="admin" className="font-body">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin — Can manage members and settings
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="expires"
                  className="font-body text-xs tracking-wider uppercase text-muted-foreground"
                >
                  Expires In (hours) <span className="text-muted-foreground/60">(optional)</span>
                </Label>
                <Input
                  id="expires"
                  type="number"
                  min="1"
                  max="720"
                  placeholder="Never expires"
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(e.target.value)}
                  className="font-body border-border rounded-none focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="maxUses"
                  className="font-body text-xs tracking-wider uppercase text-muted-foreground"
                >
                  Maximum Uses <span className="text-muted-foreground/60">(optional)</span>
                </Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Unlimited uses"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="font-body border-border rounded-none focus:border-accent"
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateInviteOpen(false)}
                disabled={creating}
                className="font-body tracking-wider uppercase border-border text-foreground hover:bg-secondary rounded-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="font-body tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary-hover rounded-none"
              >
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Member Dialog */}
      <Dialog open={deleteMemberOpen} onOpenChange={setDeleteMemberOpen}>
        <DialogContent className="bg-white border-border rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-foreground">Remove Member</DialogTitle>
            <DialogDescription className="font-body text-muted-foreground">
              Are you certain you wish to remove{" "}
              <strong className="text-foreground">
                {selectedMember?.user.name || selectedMember?.user.email}
              </strong>{" "}
              from this organization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteMemberOpen(false)}
              disabled={deleting}
              className="font-body tracking-wider uppercase border-border text-foreground hover:bg-secondary rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteMember}
              disabled={deleting}
              className="font-body tracking-wider uppercase bg-destructive text-white hover:bg-destructive-hover rounded-none"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Invite Dialog */}
      <Dialog open={deleteInviteOpen} onOpenChange={setDeleteInviteOpen}>
        <DialogContent className="bg-white border-border rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-foreground">
              Revoke Invitation
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground">
              Are you certain you wish to revoke this invitation? Anyone with the link will no
              longer be able to join.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteInviteOpen(false)}
              disabled={deleting}
              className="font-body tracking-wider uppercase border-border text-foreground hover:bg-secondary rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteInvite}
              disabled={deleting}
              className="font-body tracking-wider uppercase bg-destructive text-white hover:bg-destructive-hover rounded-none"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Revoke Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
