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
import {
  Building2,
  Link2,
  Menu,
  User,
  BookOpen,
  Settings,
  Crown,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6]">
      {/* Editorial Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#e8e6df] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex h-16 items-center gap-6">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-[#1a1a1a]"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 bg-[#faf9f6] border-r border-[#e8e6df]"
              >
                <nav className="flex flex-col gap-1 mt-8">
                  <MobileNav user={user} />
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <span className="font-serif text-2xl font-semibold text-[#1a1a1a]">
                LINKU
              </span>
              <span className="hidden sm:inline h-4 w-px bg-[#e8e6df]"></span>
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
                  className="gap-2 font-body text-sm text-[#1a1a1a] hover:text-[#d4af37]"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {user.name || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white border-[#e8e6df] rounded-none"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <span className="font-serif text-[#1a1a1a]">
                      {user.name || "Member"}
                    </span>
                    <span className="font-body text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#e8e6df]" />
                <DropdownMenuItem
                  asChild
                  className="font-body text-[#1a1a1a] focus:bg-[#f5f5f0] focus:text-[#d4af37] cursor-pointer"
                >
                  <Link href="/dashboard/orgs">
                    <Building2 className="mr-2 h-4 w-4" />
                    Organizations
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#e8e6df]" />
                <form
                  action={async () => {
                    "use server";
                    await auth.api.signOut({
                      headers: await headers(),
                    });
                  }}
                >
                  <button type="submit" className="w-full">
                    <DropdownMenuItem className="font-body text-[#b54a4a] focus:bg-[#b54a4a]/5 focus:text-[#b54a4a] cursor-pointer">
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
        <aside className="hidden lg:flex w-72 flex-col border-r border-[#e8e6df] bg-[#faf9f6] py-8">
          <nav className="flex flex-col gap-1 px-6">
            <SidebarNav user={user} />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-auto">{children}</main>
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
        <p className="font-body text-xs tracking-[0.2em] uppercase text-[#d4af37] mb-4 px-3">
          Browse
        </p>
        <Button
          variant="ghost"
          className="w-full justify-start font-body text-[#1a1a1a] hover:text-[#d4af37] hover:bg-[#f5f5f0] rounded-none"
          asChild
        >
          <Link href="/dashboard">
            <BookOpen className="mr-3 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start font-body text-[#1a1a1a] hover:text-[#d4af37] hover:bg-[#f5f5f0] rounded-none"
          asChild
        >
          <Link href="/dashboard/orgs">
            <Building2 className="mr-3 h-4 w-4" />
            Organizations
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start font-body text-[#1a1a1a] hover:text-[#d4af37] hover:bg-[#f5f5f0] rounded-none"
          asChild
        >
          <Link href="/dashboard/links">
            <Link2 className="mr-3 h-4 w-4" />
            Links
          </Link>
        </Button>
      </div>

      {/* Section divider */}
      <div className="mx-3 mb-8 h-px bg-[#e8e6df]"></div>

      {/* Section: Account */}
      <div className="mb-8">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-[#d4af37] mb-4 px-3">
          Account
        </p>
        <Button
          variant="ghost"
          className="w-full justify-start font-body text-[#1a1a1a] hover:text-[#d4af37] hover:bg-[#f5f5f0] rounded-none"
          asChild
        >
          <Link href="/dashboard/settings">
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>

      {/* Member card */}
      <div className="mt-auto mx-3 p-4 border border-[#e8e6df] bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-3 w-3 text-[#d4af37]" />
          <span className="font-body text-xs tracking-wider uppercase text-[#d4af37]">
            Member
          </span>
        </div>
        <p className="font-serif text-sm text-[#1a1a1a] truncate">
          {user.name || user.email}
        </p>
        <p className="font-body text-xs text-muted-foreground truncate mt-1">
          {user.email}
        </p>
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
        <p className="font-body text-xs tracking-[0.2em] uppercase text-[#d4af37] mb-4">
          Browse
        </p>
      </div>
      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-4 py-3 font-body text-[#1a1a1a] hover:text-[#d4af37] hover:bg-[#f5f5f0] transition-luxury"
      >
        <BookOpen className="h-4 w-4" />
        Dashboard
      </Link>
      <Link
        href="/dashboard/orgs"
        className="flex items-center gap-3 px-4 py-3 font-body text-[#1a1a1a] hover:text-[#d4af37] hover:bg-[#f5f5f0] transition-luxury"
      >
        <Building2 className="h-4 w-4" />
        Organizations
      </Link>
      <Link
        href="/dashboard/links"
        className="flex items-center gap-3 px-4 py-3 font-body text-[#1a1a1a] hover:text-[#d4af37] hover:bg-[#f5f5f0] transition-luxury"
      >
        <Link2 className="h-4 w-4" />
        Links
      </Link>

      <div className="my-6 mx-4 h-px bg-[#e8e6df]"></div>

      <div className="px-4">
        <p className="font-body text-xs text-muted-foreground mb-2">
          Signed in as
        </p>
        <p className="font-serif text-[#1a1a1a]">{user.name || user.email}</p>
        <p className="font-body text-xs text-muted-foreground">{user.email}</p>
      </div>
    </>
  );
}
