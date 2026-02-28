"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Link2,
  Plus,
  TrendingUp,
  Users,
  ArrowRight,
  Copy,
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  role: string;
  memberCount: number;
}

interface LinkItem {
  id: string;
  slug: string;
  destinationUrl: string;
  title: string | null;
  description: string | null;
  clickCount: number;
  lastClickedAt: string | null;
  createdAt: string;
  organization: {
    name: string;
    slug: string;
  };
}

interface DashboardStats {
  totalOrgs: number;
  totalLinks: number;
  totalClicks: number;
}

export default function DashboardPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [recentLinks, setRecentLinks] = useState<LinkItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrgs: 0,
    totalLinks: 0,
    totalClicks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch organizations
      const orgsResponse = await fetch("/api/orgs");
      const orgsData = await orgsResponse.json();

      // Fetch all links
      const linksResponse = await fetch("/api/links");
      const linksData = await linksResponse.json();

      if (orgsResponse.ok) {
        setOrganizations(orgsData.organizations || []);
      }

      if (linksResponse.ok) {
        const links = linksData.links || [];
        // Get 5 most recent links
        setRecentLinks(links.slice(0, 5));

        // Calculate stats
        setStats({
          totalOrgs: orgsData.organizations?.length || 0,
          totalLinks: links.length,
          totalClicks: links.reduce(
            (sum: number, link: LinkItem) => sum + link.clickCount,
            0,
          ),
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  function getShortUrl(linkItem: LinkItem) {
    return `${appUrl}/l/${linkItem.organization.slug}/${linkItem.slug}`;
  }

  async function copyToClipboard(linkItem: LinkItem) {
    const shortUrl = getShortUrl(linkItem);
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(linkItem.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
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
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-body text-muted-foreground">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-[#e8e6df] pb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-6 bg-[#d4af37]"></div>
          <span className="font-body text-xs tracking-[0.2em] uppercase text-[#d4af37]">
            Overview
          </span>
        </div>
        <h1 className="font-serif text-3xl text-[#1a1a1a]">Dashboard</h1>
        <p className="mt-2 font-body text-muted-foreground">
          Your curation at a glance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/orgs">
          <div className="group border border-[#e8e6df] bg-white p-6 hover:border-[#d4af37] transition-luxury">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="h-5 w-5 text-[#d4af37]" />
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#d4af37] transition-luxury" />
            </div>
            <p className="font-serif text-3xl text-[#1a1a1a]">
              {stats.totalOrgs}
            </p>
            <p className="font-body text-xs tracking-wider uppercase text-muted-foreground mt-1">
              Organization{stats.totalOrgs !== 1 ? "s" : ""}
            </p>
          </div>
        </Link>

        <Link href="/dashboard/links">
          <div className="group border border-[#e8e6df] bg-white p-6 hover:border-[#d4af37] transition-luxury">
            <div className="flex items-center justify-between mb-4">
              <Link2 className="h-5 w-5 text-[#d4af37]" />
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#d4af37] transition-luxury" />
            </div>
            <p className="font-serif text-3xl text-[#1a1a1a]">
              {stats.totalLinks}
            </p>
            <p className="font-body text-xs tracking-wider uppercase text-muted-foreground mt-1">
              Curated Link{stats.totalLinks !== 1 ? "s" : ""}
            </p>
          </div>
        </Link>

        <div className="border border-[#e8e6df] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-5 w-5 text-[#d4af37]" />
          </div>
          <p className="font-serif text-3xl text-[#1a1a1a]">
            {stats.totalClicks.toLocaleString()}
          </p>
          <p className="font-body text-xs tracking-wider uppercase text-muted-foreground mt-1">
            Total Clicks
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button
          asChild
          className="font-body tracking-wider uppercase bg-[#1a1a1a] text-[#faf9f6] hover:bg-[#333333] border-0 rounded-none"
        >
          <Link href="/dashboard/orgs">
            <Plus className="mr-2 h-4 w-4" />
            New Organization
          </Link>
        </Button>
        {organizations.length > 0 && (
          <Button
            variant="outline"
            asChild
            className="font-body tracking-wider uppercase border-[#e8e6df] text-[#1a1a1a] hover:bg-[#f5f5f0] rounded-none"
          >
            <Link href={`/dashboard/orgs/${organizations[0].slug}/links`}>
              <Plus className="mr-2 h-4 w-4" />
              New Link
            </Link>
          </Button>
        )}
      </div>

      {/* Recent Links Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-4 bg-[#d4af37]"></div>
              <span className="font-body text-xs tracking-[0.2em] uppercase text-[#d4af37]">
                Recently Curated
              </span>
            </div>
            <h2 className="font-serif text-xl text-[#1a1a1a]">Recent Links</h2>
          </div>
          {recentLinks.length > 0 && (
            <Button
              variant="ghost"
              asChild
              className="font-body text-[#1a1a1a] hover:text-[#d4af37]"
            >
              <Link href="/dashboard/links">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {recentLinks.length === 0 ? (
          <div className="border border-[#e8e6df] bg-white p-8 text-center">
            <Link2 className="h-10 w-10 text-[#d4af37] mx-auto mb-4" />
            <h3 className="font-serif text-lg text-[#1a1a1a]">No links yet</h3>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Start curating by creating your first link in an organization.
            </p>
            <Button
              className="mt-4 font-body tracking-wider uppercase bg-[#d4af37] text-[#1a1a1a] hover:bg-[#c9b037] border-0 rounded-none"
              asChild
            >
              <Link href="/dashboard/orgs">Browse Organizations</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLinks.map((linkItem) => (
              <article
                key={linkItem.id}
                className="group flex items-center gap-4 border border-[#e8e6df] bg-white p-4 hover:border-[#d4af37] transition-luxury"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-body text-sm font-medium text-[#1a1a1a] truncate">
                      {linkItem.title || linkItem.slug}
                    </h3>
                    <span className="text-xs text-muted-foreground">•</span>
                    <Link
                      href={`/dashboard/orgs/${linkItem.organization.slug}`}
                      className="font-body text-xs text-[#d4af37] hover:underline shrink-0"
                    >
                      {linkItem.organization.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{getShortUrl(linkItem)}</span>
                    <span>→</span>
                    <span className="truncate max-w-xs">
                      {linkItem.destinationUrl}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="font-body text-sm text-[#1a1a1a]">
                      {linkItem.clickCount}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      clicks
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(linkItem)}
                    className="font-body text-xs tracking-wider uppercase border-[#e8e6df] hover:border-[#d4af37] hover:text-[#d4af37] rounded-none"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    {copiedId === linkItem.id ? "Copied" : "Copy"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Organizations Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-4 bg-[#d4af37]"></div>
              <span className="font-body text-xs tracking-[0.2em] uppercase text-[#d4af37]">
                Your Collections
              </span>
            </div>
            <h2 className="font-serif text-xl text-[#1a1a1a]">Organizations</h2>
          </div>
          {organizations.length > 0 && (
            <Button
              variant="ghost"
              asChild
              className="font-body text-[#1a1a1a] hover:text-[#d4af37]"
            >
              <Link href="/dashboard/orgs">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {organizations.length === 0 ? (
          <div className="border border-[#e8e6df] bg-white p-8 text-center">
            <Building2 className="h-10 w-10 text-[#d4af37] mx-auto mb-4" />
            <h3 className="font-serif text-lg text-[#1a1a1a]">
              No organizations yet
            </h3>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Create your first organization to start curating links.
            </p>
            <Button
              className="mt-4 font-body tracking-wider uppercase bg-[#d4af37] text-[#1a1a1a] hover:bg-[#c9b037] border-0 rounded-none"
              asChild
            >
              <Link href="/dashboard/orgs">
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.slice(0, 6).map((org) => (
              <Link key={org.id} href={`/dashboard/orgs/${org.slug}`}>
                <article className="group h-full border border-[#e8e6df] bg-white p-5 hover:border-[#d4af37] hover:shadow-sm transition-luxury">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-9 w-9 items-center justify-center border border-[#e8e6df] group-hover:border-[#d4af37] transition-luxury">
                      <Building2 className="h-4 w-4 text-[#d4af37]" />
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
                  <h3 className="font-serif text-base text-[#1a1a1a] group-hover:text-[#d4af37] transition-luxury mb-1">
                    {org.name}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground">
                    /{org.slug}
                  </p>
                  <div className="flex items-center gap-1 font-body text-xs text-muted-foreground mt-3 pt-3 border-t border-[#e8e6df]">
                    <Users className="h-3 w-3" />
                    {org.memberCount} member{org.memberCount !== 1 ? "s" : ""}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
