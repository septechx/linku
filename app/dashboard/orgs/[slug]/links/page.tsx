"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  Plus,
  Link2,
  ArrowLeft,
} from "lucide-react";

interface LinkItem {
  id: string;
  slug: string;
  destinationUrl: string;
  title: string | null;
  description: string | null;
  clickCount: number;
  lastClickedAt: string | null;
  createdAt: string;
}

export default function LinksPage() {
  const params = useParams();
  const orgSlug = params.slug as string;

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newDestinationUrl, setNewDestinationUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit dialog state
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editDestinationUrl, setEditDestinationUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete dialog state
  const [deletingLink, setDeletingLink] = useState<LinkItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orgs/${orgSlug}/links`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch links");
      }

      setLinks(data.links);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch links");
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    try {
      const response = await fetch(`/api/orgs/${orgSlug}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: newSlug,
          destinationUrl: newDestinationUrl,
          title: newTitle || undefined,
          description: newDescription || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create link");
      }

      setNewSlug("");
      setNewDestinationUrl("");
      setNewTitle("");
      setNewDescription("");
      setShowCreateForm(false);
      fetchLinks();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create link",
      );
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLink) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const response = await fetch(`/api/links/${editingLink.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: editSlug,
          destinationUrl: editDestinationUrl,
          title: editTitle || null,
          description: editDescription || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update link");
      }

      setEditingLink(null);
      fetchLinks();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Failed to update link",
      );
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingLink) return;

    setDeleteLoading(true);

    try {
      const response = await fetch(`/api/links/${deletingLink.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete link");
      }

      setDeletingLink(null);
      fetchLinks();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete link");
    } finally {
      setDeleteLoading(false);
    }
  }

  function openEditDialog(linkItem: LinkItem) {
    setEditingLink(linkItem);
    setEditSlug(linkItem.slug);
    setEditDestinationUrl(linkItem.destinationUrl);
    setEditTitle(linkItem.title || "");
    setEditDescription(linkItem.description || "");
    setEditError(null);
  }

  function getShortUrl(linkItem: LinkItem) {
    return `${appUrl}/l/${orgSlug}/${linkItem.slug}`;
  }

  async function copyToClipboard(linkItem: LinkItem) {
    const shortUrl = getShortUrl(linkItem);
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(linkItem.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shortUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(linkItem.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-body text-muted-foreground">
          Loading collection...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-l-2 border-[#b54a4a] bg-[#b54a4a]/5 p-6">
        <p className="font-body text-[#b54a4a]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-[#e8e6df] pb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4 font-body text-muted-foreground hover:text-[#d4af37] -ml-4"
        >
          <Link href={`/dashboard/orgs/${orgSlug}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Collection
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-6 bg-[#d4af37]"></div>
              <span className="font-body text-xs tracking-[0.2em] uppercase text-[#d4af37]">
                Curated Links
              </span>
            </div>
            <h1 className="font-serif text-3xl text-[#1a1a1a]">Links</h1>
            <p className="mt-2 font-body text-muted-foreground">
              Manage your curated short links
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="font-body tracking-wider uppercase bg-[#1a1a1a] text-[#faf9f6] hover:bg-[#333333] border-0 rounded-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            {showCreateForm ? "Cancel" : "New Link"}
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="border border-[#e8e6df] bg-white p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px w-4 bg-[#d4af37]"></div>
            <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
              New Entry
            </span>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            {createError && (
              <div className="border-l-2 border-[#b54a4a] bg-[#b54a4a]/5 p-4">
                <p className="font-body text-sm text-[#b54a4a]">
                  {createError}
                </p>
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="slug"
                  className="font-body text-xs tracking-wider uppercase text-muted-foreground"
                >
                  Slug <span className="text-[#b54a4a]">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="my-curated-link"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  required
                  pattern="^[a-zA-Z0-9-_]+$"
                  title="Only letters, numbers, hyphens, and underscores allowed"
                  className="font-body border-[#e8e6df] rounded-none focus:border-[#d4af37]"
                />
                <p className="font-body text-xs text-muted-foreground">
                  URL-safe identifier
                </p>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="destinationUrl"
                  className="font-body text-xs tracking-wider uppercase text-muted-foreground"
                >
                  Destination URL <span className="text-[#b54a4a]">*</span>
                </Label>
                <Input
                  id="destinationUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={newDestinationUrl}
                  onChange={(e) => setNewDestinationUrl(e.target.value)}
                  required
                  className="font-body border-[#e8e6df] rounded-none focus:border-[#d4af37]"
                />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="font-body text-xs tracking-wider uppercase text-muted-foreground"
                >
                  Title{" "}
                  <span className="text-muted-foreground/60">(optional)</span>
                </Label>
                <Input
                  id="title"
                  placeholder="A Descriptive Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="font-body border-[#e8e6df] rounded-none focus:border-[#d4af37]"
                />
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
                  placeholder="Brief description of this link"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="font-body border-[#e8e6df] rounded-none focus:border-[#d4af37]"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-[#e8e6df]">
              <Button
                type="submit"
                disabled={createLoading}
                className="font-body tracking-wider uppercase bg-[#1a1a1a] text-[#faf9f6] hover:bg-[#333333] rounded-none"
              >
                {createLoading ? "Creating..." : "Create Link"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="font-body tracking-wider uppercase border-[#e8e6df] text-[#1a1a1a] hover:bg-[#f5f5f0] rounded-none"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {links.length === 0 ? (
        <div className="border border-[#e8e6df] bg-white p-12 text-center">
          <Link2 className="h-12 w-12 text-[#d4af37] mx-auto mb-6" />
          <h3 className="font-serif text-xl text-[#1a1a1a]">
            No links curated yet
          </h3>
          <p className="mt-3 font-body text-muted-foreground max-w-md mx-auto">
            Begin your collection by creating your first curated short link.
          </p>
          <Button
            className="mt-6 font-body tracking-wider uppercase bg-[#d4af37] text-[#1a1a1a] hover:bg-[#c9b037] border-0 rounded-none"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create First Link
          </Button>
        </div>
      ) : (
        /* Links List */
        <div className="space-y-4">
          {links.map((linkItem) => (
            <article
              key={linkItem.id}
              className="group border border-[#e8e6df] bg-white p-6 hover:border-[#d4af37] hover:shadow-sm transition-luxury"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-serif text-lg text-[#1a1a1a]">
                      {linkItem.title || linkItem.slug}
                    </h3>
                    <span className="font-body text-xs text-muted-foreground">
                      {linkItem.clickCount} clicks
                    </span>
                  </div>

                  {linkItem.description && (
                    <p className="font-body text-sm text-muted-foreground mb-3">
                      {linkItem.description}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Link
                      href={getShortUrl(linkItem)}
                      target="_blank"
                      className="font-body text-sm text-[#d4af37] hover-underline"
                    >
                      {getShortUrl(linkItem)}
                    </Link>
                    <span className="hidden sm:inline text-muted-foreground">
                      →
                    </span>
                    <span className="font-body text-sm text-muted-foreground truncate max-w-md">
                      {linkItem.destinationUrl}
                    </span>
                  </div>

                  <p className="mt-3 font-body text-xs text-muted-foreground">
                    Last accessed: {formatDate(linkItem.lastClickedAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(linkItem)}
                    className="font-body text-xs tracking-wider uppercase border-[#e8e6df] hover:border-[#d4af37] hover:text-[#d4af37] rounded-none"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    {copiedId === linkItem.id ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(linkItem)}
                    className="border-[#e8e6df] hover:border-[#1a1a1a] rounded-none"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingLink(linkItem)}
                    className="border-[#e8e6df] text-[#b54a4a] hover:border-[#b54a4a] hover:bg-[#b54a4a]/5 rounded-none"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Link href={getShortUrl(linkItem)} target="_blank">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#e8e6df] hover:border-[#d4af37] hover:text-[#d4af37] rounded-none"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
        <DialogContent className="bg-white border-[#e8e6df] rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#1a1a1a]">
              Edit Link
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground">
              Refine your curated link details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-5 py-4">
            {editError && (
              <div className="border-l-2 border-[#b54a4a] bg-[#b54a4a]/5 p-4">
                <p className="font-body text-sm text-[#b54a4a]">{editError}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label
                htmlFor="edit-slug"
                className="font-body text-xs tracking-wider uppercase text-muted-foreground"
              >
                Slug
              </Label>
              <Input
                id="edit-slug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                required
                pattern="^[a-zA-Z0-9-_]+$"
                className="font-body border-[#e8e6df] rounded-none focus:border-[#d4af37]"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="edit-destination"
                className="font-body text-xs tracking-wider uppercase text-muted-foreground"
              >
                Destination URL
              </Label>
              <Input
                id="edit-destination"
                type="url"
                value={editDestinationUrl}
                onChange={(e) => setEditDestinationUrl(e.target.value)}
                required
                className="font-body border-[#e8e6df] rounded-none focus:border-[#d4af37]"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="edit-title"
                className="font-body text-xs tracking-wider uppercase text-muted-foreground"
              >
                Title
              </Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="font-body border-[#e8e6df] rounded-none focus:border-[#d4af37]"
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
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="font-body border-[#e8e6df] rounded-none focus:border-[#d4af37]"
              />
            </div>
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingLink(null)}
                className="font-body tracking-wider uppercase border-[#e8e6df] text-[#1a1a1a] hover:bg-[#f5f5f0] rounded-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editLoading}
                className="font-body tracking-wider uppercase bg-[#1a1a1a] text-[#faf9f6] hover:bg-[#333333] rounded-none"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingLink} onOpenChange={() => setDeletingLink(null)}>
        <DialogContent className="bg-white border-[#e8e6df] rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#1a1a1a]">
              Remove Link
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground">
              Are you certain you wish to remove this link from your collection?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {deletingLink && (
              <div className="border border-[#e8e6df] bg-[#faf9f6] p-4">
                <p className="font-serif text-[#1a1a1a]">
                  {deletingLink.title || deletingLink.slug}
                </p>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  {getShortUrl(deletingLink)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingLink(null)}
              className="font-body tracking-wider uppercase border-[#e8e6df] text-[#1a1a1a] hover:bg-[#f5f5f0] rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="font-body tracking-wider uppercase bg-[#b54a4a] text-white hover:bg-[#a04040] rounded-none"
            >
              {deleteLoading ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
