"use client";

import { useState } from "react";

export interface LinkItem {
  id: string;
  slug: string;
  destinationUrl: string;
  title: string | null;
  description: string | null;
  clickCount: number;
  lastClickedAt: string | null;
  createdAt: string;
  isGlobal: boolean;
  organization?: {
    name: string;
    slug: string;
  };
}

/**
 * Generate a short URL for a link
 * @param baseUrl - The base URL of the application (window.location.origin)
 * @param orgSlug - The organization slug
 * @param linkSlug - The link slug
 * @returns The full short URL
 */
export function getShortUrl(baseUrl: string, orgSlug: string, linkSlug: string): string {
  return `${baseUrl}/l/${orgSlug}/${linkSlug}`;
}

/**
 * Generate a global short URL
 * @param baseUrl - The base URL of the application
 * @param slug - The link slug
 * @returns The full global short URL
 */
export function getGlobalUrl(baseUrl: string, slug: string): string {
  return `${baseUrl}/s/${slug}`;
}

/**
 * Generate a short URL for a link from a LinkItem object
 * @param baseUrl - The base URL of the application
 * @param linkItem - The link item with organization info
 * @returns The full short URL
 */
export function getShortUrlFromLink(baseUrl: string, linkItem: LinkItem): string {
  if (linkItem.isGlobal) {
    return getGlobalUrl(baseUrl, linkItem.slug);
  }
  const orgSlug = linkItem.organization?.slug || "";
  return `${baseUrl}/l/${orgSlug}/${linkItem.slug}`;
}

/**
 * Copy text to clipboard with fallback for older browsers
 * @param text - The text to copy
 * @param onSuccess - Callback when copy succeeds
 * @param onError - Optional callback when copy fails
 */
export async function copyToClipboard(
  text: string,
  onSuccess?: () => void,
  onError?: () => void,
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.();
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      onSuccess?.();
    } catch {
      onError?.();
    }
  }
}

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string or null
 * @param format - The format style: 'relative' | 'full' | 'short'
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | null,
  format: "relative" | "full" | "short" = "relative",
): string {
  if (!dateString) return "Never";

  const date = new Date(dateString);
  const now = new Date();

  if (format === "relative") {
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  if (format === "full") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // short format
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Hook for managing copy-to-clipboard state
 * Returns a tuple of [copiedId, copyFunction]
 * @returns [copiedId, copyToClipboardWithId]
 */
export function useCopyToClipboard(
  timeout: number = 2000,
): [string | null, (id: string, text: string) => Promise<void>] {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboardWithId = async (id: string, text: string) => {
    await copyToClipboard(text, () => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), timeout);
    });
  };

  return [copiedId, copyToClipboardWithId];
}
