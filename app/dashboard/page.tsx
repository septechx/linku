"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Link2, Plus, TrendingUp, Users, ArrowRight, Copy } from "lucide-react";
import { copyToClipboard, getShortUrlFromLink } from "@/lib/links";

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
  isGlobal: boolean;
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
          totalClicks: links.reduce((sum: number, link: LinkItem) => sum + link.clickCount, 0),
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  function getShortUrl(linkItem: LinkItem) {
    return getShortUrlFromLink(appUrl, linkItem);
  }

  async function handleCopy(linkItem: LinkItem) {
    const shortUrl = getShortUrl(linkItem);
    await copyToClipboard(shortUrl, () => {
      setCopiedId(linkItem.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-body text-muted-foreground">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-6 bg-accent"></div>
          <span className="font-body text-xs tracking-[0.2em] uppercase text-accent">Overview</span>
        </div>
        <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
        <p className="mt-2 font-body text-muted-foreground">Your curation at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/orgs" prefetch={true}>
          <div className="group border border-border bg-white p-6 hover:border-accent transition-luxury view-transition-card">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="h-5 w-5 text-accent" />
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-luxury" />
            </div>
            <p className="font-serif text-3xl text-foreground">{stats.totalOrgs}</p>
            <p className="font-body text-xs tracking-wider uppercase text-muted-foreground mt-1">
              Organization{stats.totalOrgs !== 1 ? "s" : ""}
            </p>
          </div>
        </Link>

        <Link href="/dashboard/links" prefetch={true}>
          <div className="group border border-border bg-white p-6 hover:border-accent transition-luxury view-transition-card">
            <div className="flex items-center justify-between mb-4">
              <Link2 className="h-5 w-5 text-accent" />
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-luxury" />
            </div>
            <p className="font-serif text-3xl text-foreground">{stats.totalLinks}</p>
            <p className="font-body text-xs tracking-wider uppercase text-muted-foreground mt-1">
              Curated Link{stats.totalLinks !== 1 ? "s" : ""}
            </p>
          </div>
        </Link>

        <div className="border border-border bg-white p-6 view-transition-card">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <p className="font-serif text-3xl text-foreground">
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
          className="font-body tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary-hover border-0 rounded-none"
        >
          <Link href="/dashboard/orgs" prefetch={true}>
            <Plus className="mr-2 h-4 w-4" />
            New Organization
          </Link>
        </Button>
        {organizations.length > 0 && (
          <Button
            variant="outline"
            asChild
            className="font-body tracking-wider uppercase border-border text-foreground hover:bg-secondary rounded-none"
          >
            <Link href={`/dashboard/orgs/${organizations[0].slug}/links`} prefetch={true}>
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
              <div className="h-px w-4 bg-accent"></div>
              <span className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                Recently Curated
              </span>
            </div>
            <h2 className="font-serif text-xl text-foreground">Recent Links</h2>
          </div>
          {recentLinks.length > 0 && (
            <Button
              variant="ghost"
              asChild
              className="font-body text-foreground hover:bg-secondary hover:text-foreground"
            >
              <Link href="/dashboard/links" prefetch={true}>
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {recentLinks.length === 0 ? (
          <div className="border border-border bg-white p-8 text-center">
            <Link2 className="h-10 w-10 text-accent mx-auto mb-4" />
            <h3 className="font-serif text-lg text-foreground">No links yet</h3>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Start curating by creating your first link in an organization.
            </p>
            <Button
              className="mt-4 font-body tracking-wider uppercase bg-accent text-foreground hover:bg-gold-dark border-0 rounded-none"
              asChild
            >
              <Link href="/dashboard/orgs" prefetch={true}>
                Browse Organizations
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLinks.map((linkItem) => (
              <article
                key={linkItem.id}
                className="group flex items-center gap-4 border border-border bg-white p-4 hover:border-accent transition-luxury view-transition-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-body text-sm font-medium text-foreground truncate">
                      {linkItem.title || linkItem.slug}
                    </h3>
                    <span className="text-xs text-muted-foreground">•</span>
                    <Link
                      href={`/dashboard/orgs/${linkItem.organization.slug}`}
                      prefetch={true}
                      className="font-body text-xs text-accent hover:underline shrink-0"
                    >
                      {linkItem.organization.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{getShortUrl(linkItem)}</span>
                    <span>→</span>
                    <span className="truncate max-w-xs">{linkItem.destinationUrl}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="font-body text-sm text-foreground">{linkItem.clickCount}</p>
                    <p className="font-body text-xs text-muted-foreground">clicks</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(linkItem)}
                    className="font-body text-xs tracking-wider uppercase border-border hover:border-foreground hover:bg-secondary rounded-none"
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
              <div className="h-px w-4 bg-accent"></div>
              <span className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                Your Collections
              </span>
            </div>
            <h2 className="font-serif text-xl text-foreground">Organizations</h2>
          </div>
          {organizations.length > 0 && (
            <Button
              variant="ghost"
              asChild
              className="font-body text-foreground hover:bg-secondary hover:text-foreground"
            >
              <Link href="/dashboard/orgs" prefetch={true}>
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {organizations.length === 0 ? (
          <div className="border border-border bg-white p-8 text-center">
            <Building2 className="h-10 w-10 text-accent mx-auto mb-4" />
            <h3 className="font-serif text-lg text-foreground">No organizations yet</h3>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Create your first organization to start curating links.
            </p>
            <Button
              className="mt-4 font-body tracking-wider uppercase bg-accent text-foreground hover:bg-gold-dark border-0 rounded-none"
              asChild
            >
              <Link href="/dashboard/orgs" prefetch={true}>
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.slice(0, 6).map((org) => (
              <Link key={org.id} href={`/dashboard/orgs/${org.slug}`} prefetch={true}>
                <article className="group h-full border border-border bg-white p-5 hover:border-accent hover:shadow-sm transition-luxury view-transition-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-9 w-9 items-center justify-center border border-border group-hover:border-accent transition-luxury">
                      <Building2 className="h-4 w-4 text-accent" />
                    </div>
                    <span
                      className={`text-xs font-body tracking-wider uppercase px-2 py-1 border ${
                        org.role === "owner"
                          ? "border-accent text-accent"
                          : org.role === "admin"
                            ? "border-foreground text-foreground"
                            : "border-border text-muted-foreground"
                      }`}
                    >
                      {org.role}
                    </span>
                  </div>
                  <h3 className="font-serif text-base text-foreground group-hover:text-accent transition-luxury mb-1">
                    {org.name}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground">/{org.slug}</p>
                  <div className="flex items-center gap-1 font-body text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
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
