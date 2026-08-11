import Link from "next/link";
import Image from "next/image";

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
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Image src="/icon.svg" alt="" width={28} height={28} />
            <span className="text-sm font-medium tracking-tight">AuraMail</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Back to home
          </Link>
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

        <div className="mt-14 border-t border-white/10 pt-8 text-sm leading-7 text-muted-foreground">
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

      <footer className="border-t border-white/10">
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
