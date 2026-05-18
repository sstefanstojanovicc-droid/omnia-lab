import { Logo } from "@/components/Logo";
import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-paper py-12">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 md:flex-row md:items-center md:justify-between md:px-10">
        <Logo variant="dark" className="h-auto w-36 md:w-44" />
        <nav className="flex flex-wrap gap-8 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          <Link href="#practice" className="hover:text-ink">
            Practice
          </Link>
          <Link href="#work" className="hover:text-ink">
            Work
          </Link>
          <Link href="#contact" className="hover:text-ink">
            Contact
          </Link>
          <a
            href="https://www.instagram.com/omnia___lab"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink"
          >
            Instagram
          </a>
        </nav>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          © {year} OMNIA Lab — Est. 2026
        </p>
      </div>
    </footer>
  );
}
