import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 pt-16 pb-12">
      {/* Decorative top border */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-16 text-center">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-8xl font-semibold tracking-tight text-foreground">
              LINKU
            </h1>
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gold"></div>
              <span className="font-body text-sm tracking-[0.2em] uppercase text-muted-foreground">
                Member Access
              </span>
              <div className="h-px w-8 bg-gold"></div>
            </div>
          </Link>
        </div>

        {children}

        {/* Footer note */}
        <p className="mt-10 text-center font-body text-xs text-muted-foreground">
          Secure access for subscribed members only
        </p>
      </div>
    </div>
  );
}
