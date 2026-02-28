import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6]">
      {/* Magazine Masthead Header */}
      <header className="border-b border-[#e8e6df] bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {/* Top bar */}
          <div className="flex h-12 items-center justify-between text-xs tracking-widest uppercase text-muted-foreground">
            <span>Est. 2026</span>
            <span className="hidden sm:inline">Curated Digital Experience</span>
            <span>Vol. I</span>
          </div>

          {/* Masthead */}
          <div className="flex flex-col items-center py-8 border-t border-[#e8e6df]">
            <div className="text-center">
              <h1 className="font-serif text-6xl font-semibold tracking-tight text-[#1a1a1a] md:text-8xl lg:text-9xl">
                LINKU
              </h1>
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="h-px w-16 bg-[#d4af37]"></div>
                <p className="font-body text-sm tracking-[0.3em] uppercase text-muted-foreground">
                  The Art of Organization
                </p>
                <div className="h-px w-16 bg-[#d4af37]"></div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex h-14 items-center justify-center gap-8 border-t border-[#e8e6df]">
            <Link
              href="/"
              className="font-body text-sm tracking-wider uppercase hover-underline transition-luxury hover:text-[#d4af37]"
            >
              Editorial
            </Link>
            <Link
              href="/login"
              className="font-body text-sm tracking-wider uppercase hover-underline transition-luxury hover:text-[#d4af37]"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="font-body text-sm tracking-wider uppercase text-[#d4af37] hover-underline transition-luxury"
            >
              Subscribe
            </Link>
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
                <div className="h-px w-8 bg-[#d4af37]"></div>
                <span className="font-body text-xs tracking-[0.2em] uppercase text-[#d4af37]">
                  Featured
                </span>
              </div>

              <h2 className="font-serif text-4xl font-medium leading-[1.1] text-[#1a1a1a] md:text-5xl lg:text-6xl">
                Your Links,
                <br />
                <span className="italic text-[#666666]">Beautifully</span>
                <br />
                Organized
              </h2>

              <p className="mt-8 font-body text-lg leading-relaxed text-muted-foreground max-w-md">
                A refined approach to bookmark management. Curate your digital
                world with elegance and intention.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="font-body tracking-wider uppercase bg-[#1a1a1a] text-[#faf9f6] hover:bg-[#333333] border-0 rounded-none px-8"
                  >
                    Begin Your Collection
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-body tracking-wider uppercase border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#faf9f6] rounded-none px-8"
                  >
                    Return
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Element */}
            <div className="lg:col-span-6 lg:col-start-7">
              <div className="relative">
                {/* Decorative frame */}
                <div className="absolute -inset-4 border border-[#d4af37]/30"></div>
                <div className="absolute -inset-8 border border-[#e8e6df]"></div>

                {/* Content block */}
                <div className="relative bg-white p-8 lg:p-12 shadow-sm">
                  <div className="space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 border-b border-[#e8e6df] pb-8">
                      <div className="text-center">
                        <div className="font-serif text-3xl text-[#d4af37]">
                          ∞
                        </div>
                        <div className="mt-1 font-body text-xs tracking-wider uppercase text-muted-foreground">
                          Links
                        </div>
                      </div>
                      <div className="text-center border-x border-[#e8e6df]">
                        <div className="font-serif text-3xl text-[#1a1a1a]">
                          ∞
                        </div>
                        <div className="mt-1 font-body text-xs tracking-wider uppercase text-muted-foreground">
                          Orgs
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-serif text-3xl text-[#666666]">
                          0
                        </div>
                        <div className="mt-1 font-body text-xs tracking-wider uppercase text-muted-foreground">
                          Limits
                        </div>
                      </div>
                    </div>

                    {/* Quote */}
                    <blockquote className="font-serif text-xl italic text-[#1a1a1a] leading-relaxed">
                      &ldquo;The difference between something good and something
                      great is attention to detail.&rdquo;
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
            <div className="h-px flex-1 bg-[#e8e6df]"></div>
            <div className="h-2 w-2 rotate-45 bg-[#d4af37]"></div>
            <div className="h-px flex-1 bg-[#e8e6df]"></div>
          </div>
        </div>

        {/* Features Grid - Magazine Layout */}
        <section className="mx-auto max-w-7xl px-6 lg:px-12 py-16">
          <div className="mb-12 text-center">
            <span className="font-body text-xs tracking-[0.3em] uppercase text-[#d4af37]">
              Inside This Issue
            </span>
            <h3 className="mt-4 font-serif text-3xl text-[#1a1a1a]">
              Features & Sections
            </h3>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <article className="group">
              <div className="border-b-2 border-[#d4af37] pb-4 mb-4">
                <span className="font-serif text-4xl text-[#d4af37]">01</span>
              </div>
              <h4 className="font-serif text-xl text-[#1a1a1a] mb-3 group-hover:text-[#d4af37] transition-luxury">
                Curated Collections
              </h4>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                Organize your links into elegant collections. Each folder tells
                a story, each bookmark a chapter in your digital narrative.
              </p>
            </article>

            {/* Feature 2 */}
            <article className="group">
              <div className="border-b-2 border-[#1a1a1a] pb-4 mb-4">
                <span className="font-serif text-4xl text-[#1a1a1a]">02</span>
              </div>
              <h4 className="font-serif text-xl text-[#1a1a1a] mb-3 group-hover:text-[#d4af37] transition-luxury">
                Collaborative Spaces
              </h4>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                Share your curated finds with teams and communities. Beautiful
                organization, multiplied by collective wisdom.
              </p>
            </article>

            {/* Feature 3 */}
            <article className="group">
              <div className="border-b-2 border-[#666666] pb-4 mb-4">
                <span className="font-serif text-4xl text-[#666666]">03</span>
              </div>
              <h4 className="font-serif text-xl text-[#1a1a1a] mb-3 group-hover:text-[#d4af37] transition-luxury">
                Effortless Discovery
              </h4>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                Find what you need with refined search. Your links, instantly
                accessible, always within reach.
              </p>
            </article>
          </div>
        </section>

        {/* CTA Section - Full Width */}
        <section className="bg-[#1a1a1a] py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-12 text-center">
            <span className="font-body text-xs tracking-[0.3em] uppercase text-[#d4af37]">
              Join Our Readers
            </span>
            <h3 className="mt-6 font-serif text-3xl md:text-4xl text-[#faf9f6] leading-tight">
              Begin Your Curated Journey Today
            </h3>
            <p className="mt-6 font-body text-lg text-[#a0a0a0] max-w-2xl mx-auto">
              Experience bookmark management reimagined. Where functionality
              meets timeless elegance.
            </p>
            <div className="mt-10">
              <Link href="/register">
                <Button
                  size="lg"
                  className="font-body tracking-wider uppercase bg-[#d4af37] text-[#1a1a1a] hover:bg-[#c9b037] border-0 rounded-none px-12"
                >
                  Start Your Subscription
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Magazine Style */}
      <footer className="border-t border-[#e8e6df] bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-8 py-12 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <h4 className="font-serif text-2xl text-[#1a1a1a]">LINKU</h4>
              <p className="mt-4 font-body text-sm text-muted-foreground max-w-sm">
                A refined bookmark management experience for the modern curator.
                Organize with intention, access with elegance.
              </p>
            </div>

            {/* Links */}
            <div>
              <h5 className="font-body text-xs tracking-[0.2em] uppercase text-[#d4af37] mb-4">
                Navigation
              </h5>
              <ul className="space-y-2 font-body text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-[#1a1a1a] transition-luxury"
                  >
                    Editorial
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-[#1a1a1a] transition-luxury"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-muted-foreground hover:text-[#1a1a1a] transition-luxury"
                  >
                    Subscribe
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="font-body text-xs tracking-[0.2em] uppercase text-[#d4af37] mb-4">
                Legal
              </h5>
              <ul className="space-y-2 font-body text-sm">
                <li>
                  <span className="text-muted-foreground">Privacy Policy</span>
                </li>
                <li>
                  <span className="text-muted-foreground">
                    Terms of Service
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[#e8e6df] py-6">
            <p className="font-body text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} LINKU. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-[#d4af37]"></div>
              <span className="font-serif text-lg text-[#d4af37]">L</span>
              <div className="h-px w-8 bg-[#d4af37]"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
