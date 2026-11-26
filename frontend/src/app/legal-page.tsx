import Link from "next/link";
import { SiteNav } from "@/components/landing/SiteNav";

type LegalPageProps = {
  title: string;
  updated: string;
  children: React.ReactNode;
};

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <div className="relative min-h-screen">
      <div aria-hidden="true" className="paper-grain pointer-events-none fixed inset-0" />
      <SiteNav base="/" />

      <main className="relative">
        <article className="mx-auto max-w-3xl px-6 pt-36 pb-24 sm:pt-44">
          <h1
            className="hero-rise text-[clamp(40px,6vw,64px)] leading-[1.02] font-medium tracking-[-0.035em] text-balance"
            style={{ animationDelay: "0.12s" }}
          >
            {title}
          </h1>
          <p className="hero-rise mt-5 text-sm text-muted-foreground" style={{ animationDelay: "0.24s" }}>
            Last updated {updated}
          </p>

          <div
            className="hero-rise mt-14 space-y-12 text-[15px] leading-7 text-muted-foreground [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-[-0.02em] [&_h2]:text-foreground [&_li]:pl-2 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:mt-3 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
            style={{ animationDelay: "0.36s" }}
          >
            {children}
          </div>

          <div className="mt-16 border-t pt-8 text-[15px] leading-7 text-muted-foreground">
            Questions about this page or your data? Contact AuraMail through the
            <a
              href="https://github.com/R7rainz/AuraMail/issues"
              target="_blank"
              rel="noreferrer"
              className="ml-1 text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              public AuraMail support channel
            </a>
            .
          </div>
        </article>
      </main>

      <footer className="relative border-t">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-x-6 gap-y-2 px-6 py-8 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy Policy</Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">Terms of Service</Link>
        </div>
      </footer>
    </div>
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
