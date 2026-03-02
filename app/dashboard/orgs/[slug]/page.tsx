"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Link2,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  Crown,
  Shield,
  User,
  Users,
} from "lucide-react";

interface Member {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  createdAt: string;
  role: "owner" | "admin" | "member";
  members: Member[];
}

export default function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = useCallback(
    async (slug: string) => {
      try {
        const response = await fetch(`/api/orgs/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/dashboard/orgs");
            return;
          }
          throw new Error("Failed to fetch organization");
        }
        const data = await response.json();
        setOrg(data.organization);
        setFormData({
          name: data.organization.name,
          description: data.organization.description || "",
        });
      } catch (err) {
        console.error("Error fetching organization:", err);
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const loadOrg = async () => {
      const { slug } = await params;
      fetchOrganization(slug);
    };
    loadOrg();
  }, [params, fetchOrganization]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;

    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/orgs/${org.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update organization");
      }

      const data = await response.json();
      setOrg(data.organization);
      setEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update organization");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!org) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/orgs/${org.slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete organization");
      }

      router.push("/dashboard/orgs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete organization");
      setDeleting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-accent" />;
      case "admin":
        return <Shield className="h-4 w-4 text-foreground" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

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
        <p className="font-body text-muted-foreground">Collection not found</p>
        <Button
          asChild
          className="mt-4 font-body tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary-hover rounded-none"
        >
          <Link href="/dashboard/orgs">Return to Collections</Link>
        </Button>
      </div>
    );
  }

  const canEdit = org.role === "owner" || org.role === "admin";
  const canDelete = org.role === "owner";

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
          <Link href="/dashboard/orgs">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Collections
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-6 bg-accent"></div>
              <span className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                Collection
              </span>
            </div>
            <h1 className="font-serif text-3xl text-foreground">{org.name}</h1>
            <p className="mt-2 font-body text-muted-foreground">/{org.slug}</p>
          </div>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-secondary hover:text-foreground"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-border rounded-none">
                <DropdownMenuItem
                  onClick={() => setEditDialogOpen(true)}
                  className="font-body text-foreground focus:bg-secondary focus:text-accent cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Collection
                </DropdownMenuItem>
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="font-body text-destructive focus:bg-destructive/5 focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Description */}
      {org.description && (
        <div className="border border-border bg-white p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-4 bg-accent"></div>
            <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
              About
            </span>
          </div>
          <p className="font-body text-lg leading-relaxed text-foreground">{org.description}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px w-4 bg-accent"></div>
          <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Access
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href={`/dashboard/orgs/${org.slug}/links`}>
            <article className="group border border-border bg-white p-6 hover:border-accent hover:shadow-sm transition-luxury">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center border border-border group-hover:border-accent transition-luxury">
                  <Link2 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-foreground group-hover:text-accent transition-luxury">
                    Links
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Manage your curated links
                  </p>
                </div>
              </div>
            </article>
          </Link>
          <Link href={`/dashboard/orgs/${org.slug}/members`}>
            <article className="group border border-border bg-white p-6 hover:border-accent hover:shadow-sm transition-luxury">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center border border-border group-hover:border-accent transition-luxury">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-foreground group-hover:text-accent transition-luxury">
                    Members
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Manage contributors and invites
                  </p>
                </div>
              </div>
            </article>
          </Link>
        </div>
      </div>

      {/* Members */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-px w-4 bg-accent"></div>
            <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
              Contributors
            </span>
          </div>
          <span className="font-body text-sm text-muted-foreground">
            {org.members.length} member{org.members.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="border border-border bg-white">
          {org.members.map((member, index) => (
            <div
              key={member.id}
              className={`flex items-center justify-between p-6 ${index !== org.members.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center border border-border bg-background">
                  {member.user.image ? (
                    <Image
                      src={member.user.image}
                      alt={member.user.name || ""}
                      width={40}
                      height={40}
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="font-serif text-lg text-foreground">
                      {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-serif text-foreground">
                    {member.user.name || member.user.email}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getRoleIcon(member.role)}
                <span
                  className={`text-xs font-body tracking-wider uppercase px-2 py-1 border ${
                    member.role === "owner"
                      ? "border-accent text-accent"
                      : member.role === "admin"
                        ? "border-foreground text-foreground"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-white border-border rounded-none">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-foreground">
                Edit Collection
              </DialogTitle>
              <DialogDescription className="font-body text-muted-foreground">
                Refine your organization&apos;s details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-6">
              {error && (
                <div className="border-l-2 border-destructive bg-destructive/5 p-4">
                  <p className="font-body text-sm text-destructive">{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-name"
                  className="font-body text-xs tracking-wider uppercase text-muted-foreground"
                >
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="font-body border-border rounded-none focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-description"
                  className="font-body text-xs tracking-wider uppercase text-muted-foreground"
                >
                  Description
                </Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief description"
                  className="font-body border-border rounded-none focus:border-accent"
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={updating}
                className="font-body tracking-wider uppercase border-border text-foreground hover:bg-secondary rounded-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updating}
                className="font-body tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary-hover rounded-none"
              >
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white border-border rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-foreground">
              Delete Collection
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground">
              Are you certain you wish to delete{" "}
              <strong className="text-foreground">{org.name}</strong>? This action cannot be undone.
              All associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="border-l-2 border-destructive bg-destructive/5 p-4 my-4">
              <p className="font-body text-sm text-destructive">{error}</p>
            </div>
          )}
          <DialogFooter className="gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="font-body tracking-wider uppercase border-border text-foreground hover:bg-secondary rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="font-body tracking-wider uppercase bg-destructive text-white hover:bg-destructive-hover rounded-none"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
