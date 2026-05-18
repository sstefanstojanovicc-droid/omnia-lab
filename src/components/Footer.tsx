import { Logo } from "@/components/Logo";
import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-paper py-10 sm:py-12">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-7 px-5 sm:px-6 md:flex-row md:items-center md:justify-between md:px-10">
        <Logo variant="dark" className="h-auto w-32 sm:w-36 md:w-44" />
        <nav className="grid grid-cols-2 gap-x-8 gap-y-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted sm:flex sm:flex-wrap sm:gap-8 sm:tracking-[0.2em]">
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
        <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-ink-muted sm:tracking-[0.2em]">
          © {year} OMNIA — Est. 2026
        </p>
      </div>
    </footer>
  );
}
