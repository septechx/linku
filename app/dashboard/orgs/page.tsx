"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Building2, Plus, Users, Loader2, Crown } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  role: "owner" | "admin" | "member";
  memberCount: number;
}

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/orgs");
      if (!response.ok) throw new Error("Failed to fetch organizations");
      const data = await response.json();
      setOrganizations(data.organizations);
    } catch (err) {
      console.error("Error fetching organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create organization");
      }

      const { organization } = await response.json();
      setDialogOpen(false);
      setFormData({ name: "", slug: "", description: "" });
      router.push(`/dashboard/orgs/${organization.slug}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create organization",
      );
    } finally {
      setCreating(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#e8e6df] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-6 bg-[#d4af37]"></div>
            <span className="font-body text-xs tracking-[0.2em] uppercase text-[#d4af37]">
              Collections
            </span>
          </div>
          <h1 className="font-serif text-3xl text-[#1a1a1a]">Organizations</h1>
          <p className="mt-2 font-body text-muted-foreground">
            Manage your curated collections and memberships
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-body tracking-wider uppercase bg-[#1a1a1a] text-[#faf9f6] hover:bg-[#333333] border-0 rounded-none">
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-[#e8e6df] rounded-none max-w-lg">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-[#1a1a1a]">
                  Create Collection
                </DialogTitle>
                <DialogDescription className="font-body text-muted-foreground">
                  Establish a new organization for your curated links.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-6">
                {error && (
                  <div className="border-l-2 border-[#b54a4a] bg-[#b54a4a]/5 p-4">
                    <p className="font-body text-sm text-[#b54a4a]">{error}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="font-body text-xs tracking-wider uppercase text-muted-foreground"
                  >
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="The Curator's Guild"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        name,
                        slug: formData.slug || generateSlug(name),
                      });
                    }}
                    required
                    className="font-body border-[#e8e6df] rounded-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="slug"
                    className="font-body text-xs tracking-wider uppercase text-muted-foreground"
                  >
                    Slug
                  </Label>
                  <Input
                    id="slug"
                    placeholder="curators-guild"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                    pattern="[a-z0-9-]+"
                    title="Only lowercase letters, numbers, and hyphens"
                    className="font-body border-[#e8e6df] rounded-none focus:border-[#d4af37]"
                  />
                  <p className="font-body text-xs text-muted-foreground">
                    /dashboard/orgs/{formData.slug || "your-slug"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="font-body text-xs tracking-wider uppercase text-muted-foreground"
                  >
                    Description{" "}
                    <span className="text-muted-foreground/60">(optional)</span>
                  </Label>
                  <Input
                    id="description"
                    placeholder="A distinguished collection of digital artifacts"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="font-body border-[#e8e6df] rounded-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={creating}
                  className="font-body tracking-wider uppercase border-[#e8e6df] text-[#1a1a1a] hover:bg-[#f5f5f0] rounded-none"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="font-body tracking-wider uppercase bg-[#1a1a1a] text-[#faf9f6] hover:bg-[#333333] rounded-none"
                >
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
        </div>
      ) : organizations.length === 0 ? (
        <div className="border border-[#e8e6df] bg-white p-12 text-center">
          <Building2 className="h-12 w-12 text-[#d4af37] mx-auto mb-6" />
          <h3 className="font-serif text-xl text-[#1a1a1a]">
            No collections yet
          </h3>
          <p className="mt-3 font-body text-muted-foreground max-w-md mx-auto">
            Begin your curation journey by creating your first organization.
          </p>
          <Button
            className="mt-6 font-body tracking-wider uppercase bg-[#d4af37] text-[#1a1a1a] hover:bg-[#c9b037] border-0 rounded-none"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Collection
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Link key={org.id} href={`/dashboard/orgs/${org.slug}`}>
              <article className="group h-full border border-[#e8e6df] bg-white p-6 hover:border-[#d4af37] hover:shadow-sm transition-luxury">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-[#e8e6df] group-hover:border-[#d4af37] transition-luxury">
                      <Building2 className="h-5 w-5 text-[#d4af37]" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-[#1a1a1a] group-hover:text-[#d4af37] transition-luxury">
                        {org.name}
                      </h3>
                      <p className="font-body text-xs text-muted-foreground">
                        /{org.slug}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-body tracking-wider uppercase px-2 py-1 border ${
                      org.role === "owner"
                        ? "border-[#d4af37] text-[#d4af37]"
                        : org.role === "admin"
                          ? "border-[#1a1a1a] text-[#1a1a1a]"
                          : "border-[#e8e6df] text-muted-foreground"
                    }`}
                  >
                    {org.role}
                  </span>
                </div>
                {org.description && (
                  <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-2">
                    {org.description}
                  </p>
                )}
                <div className="flex items-center gap-1 font-body text-xs text-muted-foreground pt-4 border-t border-[#e8e6df]">
                  <Users className="h-3 w-3" />
                  {org.memberCount} member{org.memberCount !== 1 ? "s" : ""}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
