import Link from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
};

export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: LegalPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <header className="app-header border-b">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span className="brand-mark grid size-7 place-items-center rounded-md text-[11px] font-bold">A</span>
            <span className="text-sm font-semibold tracking-tight">AuraMail</span>
          </Link>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-5 text-xs text-muted-foreground sm:flex" aria-label="Legal navigation">
              <Link href="/#how-it-works" className="hover:text-foreground">How it works</Link>
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
            </nav>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          {eyebrow}
        </p>
        <h1 className="display-serif mt-5 text-4xl text-balance sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          Last updated: {updated}
        </p>

        <div className="mt-12 space-y-10 text-sm leading-7 text-muted-foreground [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-foreground [&_h2]:tracking-tight [&_li]:pl-2 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:mt-3 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
          {children}
        </div>

        <div className="mt-14 border-t pt-8 text-sm leading-7 text-muted-foreground">
          Questions about this page or your data? Contact AuraMail through the
          <a
            href="https://github.com/R7rainz/AuraMail/issues"
            target="_blank"
            rel="noreferrer"
            className="ml-1 text-primary underline underline-offset-4"
          >
            public AuraMail support channel
          </a>
          .
        </div>
      </article>

      <footer className="border-t">
        <div className="mx-auto flex max-w-4xl flex-wrap gap-x-5 gap-y-2 px-6 py-8 font-mono text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
        </div>
      </footer>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
