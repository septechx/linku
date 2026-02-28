import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Building2, Link2, Menu, User, BookOpen, Settings, Crown } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Editorial Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-sm view-transition-header">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex h-16 items-center gap-6">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-background border-r border-border">
                <nav className="flex flex-col gap-1 mt-8">
                  <MobileNav user={user} />
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" prefetch={true} className="flex items-center gap-3">
              <span className="font-serif text-2xl font-semibold text-foreground">LINKU</span>
              <span className="hidden sm:inline h-4 w-px bg-border"></span>
              <span className="hidden sm:inline font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">
                Editorial
              </span>
            </Link>

            <div className="flex-1" />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 font-body text-sm text-foreground hover:bg-secondary hover:text-foreground"
                >
                  <User className="h-4 w-4 text-accent" />
                  <span className="hidden sm:inline">{user.name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-border rounded-none">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <span className="font-serif text-foreground">{user.name || "Member"}</span>
                    <span className="font-body text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <form
                  action={async () => {
                    "use server";
                    await auth.api.signOut({
                      headers: await headers(),
                    });
                    redirect("/");
                  }}
                >
                  <button type="submit" className="w-full">
                    <DropdownMenuItem className="font-body text-destructive focus:bg-destructive/5 focus:text-destructive cursor-pointer">
                      Sign out
                    </DropdownMenuItem>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 mx-auto max-w-7xl w-full">
        {/* Editorial Sidebar - Desktop */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-background py-8 view-transition-sidebar">
          <nav className="flex flex-col gap-1 px-6">
            <SidebarNav user={user} />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-auto view-transition-main">{children}</main>
      </div>
    </div>
  );
}

function SidebarNav({
  user,
}: {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
}) {
  return (
    <>
      {/* Section: Browse */}
      <div className="mb-8">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4 px-3">Browse</p>
        <Button
          variant="ghost"
          className="w-full justify-start font-body text-foreground hover:text-accent hover:bg-secondary rounded-none"
          asChild
        >
          <Link href="/dashboard" prefetch={true}>
            <BookOpen className="mr-3 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start font-body text-foreground hover:text-accent hover:bg-secondary rounded-none"
          asChild
        >
          <Link href="/dashboard/orgs" prefetch={true}>
            <Building2 className="mr-3 h-4 w-4" />
            Organizations
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start font-body text-foreground hover:text-accent hover:bg-secondary rounded-none"
          asChild
        >
          <Link href="/dashboard/links" prefetch={true}>
            <Link2 className="mr-3 h-4 w-4" />
            Links
          </Link>
        </Button>
      </div>

      {/* Section divider */}
      <div className="mx-3 mb-8 h-px bg-border"></div>

      {/* Section: Account */}
      <div className="mb-8">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4 px-3">
          Account
        </p>
        <Button
          variant="ghost"
          className="w-full justify-start font-body text-foreground hover:text-accent hover:bg-secondary rounded-none"
          asChild
        >
          <Link href="/dashboard/settings" prefetch={true}>
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>

      {/* Member card */}
      <div className="mt-auto mx-3 p-4 border border-border bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-3 w-3 text-accent" />
          <span className="font-body text-xs tracking-wider uppercase text-accent">Member</span>
        </div>
        <p className="font-serif text-sm text-foreground truncate">{user.name || user.email}</p>
        <p className="font-body text-xs text-muted-foreground truncate mt-1">{user.email}</p>
      </div>
    </>
  );
}

function MobileNav({
  user,
}: {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
}) {
  return (
    <>
      <div className="mb-6 px-4">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4">Browse</p>
      </div>
      <Link
        href="/dashboard"
        prefetch={true}
        className="flex items-center gap-3 px-4 py-3 font-body text-foreground hover:text-accent hover:bg-secondary transition-luxury"
      >
        <BookOpen className="h-4 w-4" />
        Dashboard
      </Link>
      <Link
        href="/dashboard/orgs"
        prefetch={true}
        className="flex items-center gap-3 px-4 py-3 font-body text-foreground hover:text-accent hover:bg-secondary transition-luxury"
      >
        <Building2 className="h-4 w-4" />
        Organizations
      </Link>
      <Link
        href="/dashboard/links"
        prefetch={true}
        className="flex items-center gap-3 px-4 py-3 font-body text-foreground hover:text-accent hover:bg-secondary transition-luxury"
      >
        <Link2 className="h-4 w-4" />
        Links
      </Link>

      <div className="my-6 mx-4 h-px bg-border"></div>

      <div className="px-4">
        <p className="font-body text-xs text-muted-foreground mb-2">Signed in as</p>
        <p className="font-serif text-foreground">{user.name || user.email}</p>
        <p className="font-body text-xs text-muted-foreground">{user.email}</p>
      </div>
    </>
  );
}
