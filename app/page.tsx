import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAuthenticated = !!session;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Magazine Masthead Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {/* Top bar */}
          <div className="flex h-12 items-center justify-between text-xs tracking-widest uppercase text-muted-foreground">
            <span>Est. 2026</span>
            <span className="hidden sm:inline">Curated Digital Experience</span>
            <span>Vol. I</span>
          </div>

          {/* Masthead */}
          <div className="flex flex-col items-center py-8 border-t border-border">
            <div className="text-center">
              <h1 className="font-serif text-6xl font-semibold tracking-tight text-foreground md:text-8xl lg:text-9xl">
                LINKU
              </h1>
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="h-px w-16 bg-accent"></div>
                <p className="font-body text-sm tracking-[0.3em] uppercase text-muted-foreground">
                  The Art of Organization
                </p>
                <div className="h-px w-16 bg-accent"></div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex h-14 items-center justify-center gap-8 border-t border-border">
            <Link
              href="/"
              prefetch={true}
              className="font-body text-sm tracking-wider uppercase hover-underline transition-luxury hover:text-accent"
            >
              Editorial
            </Link>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                prefetch={true}
                className="font-body text-sm tracking-wider uppercase hover-underline transition-luxury hover:text-accent"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  prefetch={true}
                  className="font-body text-sm tracking-wider uppercase hover-underline transition-luxury hover:text-accent"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  className="font-body text-sm tracking-wider uppercase text-accent hover-underline transition-luxury"
                >
                  Subscribe
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section - Magazine Cover Style */}
      <main className="flex-1">
        {/* Feature Story */}
        <section className="mx-auto max-w-7xl px-6 lg:px-12 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-center">
            {/* Text Content - Asymmetric */}
            <div className="lg:col-span-5 lg:col-start-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-accent"></div>
                <span className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                  Featured
                </span>
              </div>

              <h2 className="font-serif text-4xl font-medium leading-[1.1] text-foreground md:text-5xl lg:text-6xl">
                Your Links,
                <br />
                <span className="italic text-muted-foreground">Beautifully</span>
                <br />
                Organized
              </h2>

              <p className="mt-8 font-body text-lg leading-relaxed text-muted-foreground max-w-md">
                A refined approach to bookmark management. Curate your digital world with elegance
                and intention.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-6">
                {isAuthenticated ? (
                  <Link href="/dashboard" prefetch={true}>
                    <Button
                      size="lg"
                      className="font-body tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary-hover border-0 rounded-none px-8"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register" prefetch={true}>
                      <Button
                        size="lg"
                        className="font-body tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary-hover border-0 rounded-none px-8"
                      >
                        Begin Your Collection
                      </Button>
                    </Link>
                    <Link href="/login" prefetch={true}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="font-body tracking-wider uppercase border-primary text-foreground hover:bg-primary hover:text-primary-foreground rounded-none px-8"
                      >
                        Return
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Visual Element */}
            <div className="lg:col-span-6 lg:col-start-7">
              <div className="relative">
                {/* Decorative frame */}
                <div className="absolute -inset-4 border border-accent/30"></div>
                <div className="absolute -inset-8 border border-border"></div>

                {/* Content block */}
                <div className="relative bg-white p-8 lg:p-12 shadow-sm">
                  <div className="space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 border-b border-border pb-8">
                      <div className="text-center">
                        <div className="font-serif text-3xl text-accent">∞</div>
                        <div className="mt-1 font-body text-xs tracking-wider uppercase text-muted-foreground">
                          Links
                        </div>
                      </div>
                      <div className="text-center border-x border-border">
                        <div className="font-serif text-3xl text-foreground">∞</div>
                        <div className="mt-1 font-body text-xs tracking-wider uppercase text-muted-foreground">
                          Orgs
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-serif text-3xl text-muted-foreground">0</div>
                        <div className="mt-1 font-body text-xs tracking-wider uppercase text-muted-foreground">
                          Limits
                        </div>
                      </div>
                    </div>

                    {/* Quote */}
                    <blockquote className="font-serif text-xl italic text-foreground leading-relaxed">
                      &ldquo;The difference between something good and something great is attention
                      to detail.&rdquo;
                    </blockquote>
                    <cite className="font-body text-sm text-muted-foreground not-italic">
                      — Charles R. Swindoll
                    </cite>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex items-center gap-4 py-8">
            <div className="h-px flex-1 bg-border"></div>
            <div className="h-2 w-2 rotate-45 bg-accent"></div>
            <div className="h-px flex-1 bg-border"></div>
          </div>
        </div>

        {/* Features Grid - Magazine Layout */}
        <section className="mx-auto max-w-7xl px-6 lg:px-12 py-16">
          <div className="mb-12 text-center">
            <span className="font-body text-xs tracking-[0.3em] uppercase text-accent">
              Inside This Issue
            </span>
            <h3 className="mt-4 font-serif text-3xl text-foreground">Features & Sections</h3>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <article className="group">
              <div className="border-b-2 border-accent pb-4 mb-4">
                <span className="font-serif text-4xl text-accent">01</span>
              </div>
              <h4 className="font-serif text-xl text-foreground mb-3 group-hover:text-accent transition-luxury">
                Curated Collections
              </h4>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                Organize your links into elegant collections. Each folder tells a story, each
                bookmark a chapter in your digital narrative.
              </p>
            </article>

            {/* Feature 2 */}
            <article className="group">
              <div className="border-b-2 border-primary pb-4 mb-4">
                <span className="font-serif text-4xl text-foreground">02</span>
              </div>
              <h4 className="font-serif text-xl text-foreground mb-3 group-hover:text-accent transition-luxury">
                Collaborative Spaces
              </h4>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                Share your curated finds with teams and communities. Beautiful organization,
                multiplied by collective wisdom.
              </p>
            </article>

            {/* Feature 3 */}
            <article className="group">
              <div className="border-b-2 border-muted-foreground pb-4 mb-4">
                <span className="font-serif text-4xl text-muted-foreground">03</span>
              </div>
              <h4 className="font-serif text-xl text-foreground mb-3 group-hover:text-accent transition-luxury">
                Effortless Discovery
              </h4>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                Find what you need with refined search. Your links, instantly accessible, always
                within reach.
              </p>
            </article>
          </div>
        </section>

        {/* CTA Section - Full Width */}
        <section className="bg-primary py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-12 text-center">
            <span className="font-body text-xs tracking-[0.3em] uppercase text-accent">
              Join Our Readers
            </span>
            <h3 className="mt-6 font-serif text-3xl md:text-4xl text-primary-foreground leading-tight">
              Begin Your Curated Journey Today
            </h3>
            <p className="mt-6 font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience bookmark management reimagined. Where functionality meets timeless
              elegance.
            </p>
            <div className="mt-10">
              {isAuthenticated ? (
                <Link href="/dashboard" prefetch={true}>
                  <Button
                    size="lg"
                    className="font-body tracking-wider uppercase bg-accent text-foreground hover:bg-gold-dark border-0 rounded-none px-12"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/register" prefetch={true}>
                  <Button
                    size="lg"
                    className="font-body tracking-wider uppercase bg-accent text-foreground hover:bg-gold-dark border-0 rounded-none px-12"
                  >
                    Start Your Subscription
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Magazine Style */}
      <footer className="border-t border-border bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-8 py-12 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <h4 className="font-serif text-2xl text-foreground">LINKU</h4>
              <p className="mt-4 font-body text-sm text-muted-foreground max-w-sm">
                A refined bookmark management experience for the modern curator. Organize with
                intention, access with elegance.
              </p>
            </div>

            {/* Links */}
            <div>
              <h5 className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4">
                Navigation
              </h5>
              <ul className="space-y-2 font-body text-sm">
                <li>
                  <Link
                    href="/"
                    prefetch={true}
                    className="text-muted-foreground hover:text-foreground transition-luxury"
                  >
                    Editorial
                  </Link>
                </li>
                {isAuthenticated ? (
                  <li>
                    <Link
                      href="/dashboard"
                      prefetch={true}
                      className="text-muted-foreground hover:text-foreground transition-luxury"
                    >
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/login"
                        prefetch={true}
                        className="text-muted-foreground hover:text-foreground transition-luxury"
                      >
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/register"
                        prefetch={true}
                        className="text-muted-foreground hover:text-foreground transition-luxury"
                      >
                        Subscribe
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-4">
                Legal
              </h5>
              <ul className="space-y-2 font-body text-sm">
                <li>
                  <span className="text-muted-foreground">Privacy Policy</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Terms of Service</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-border py-6">
            <p className="font-body text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} LINKU. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-accent"></div>
              <span className="font-serif text-lg text-accent">L</span>
              <div className="h-px w-8 bg-accent"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
