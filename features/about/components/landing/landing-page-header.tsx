import { Link } from "next-view-transitions";

export function LandingPageHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-zinc-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl font-black tracking-tight text-white transition-opacity hover:opacity-80"
        >
          سوكاني <span className="text-brand-400">مصر</span>
        </Link>
        <Link
          href="/products"
          className="rounded-full bg-brand-500 px-5 py-2 text-sm font-black text-black transition-colors hover:bg-brand-400"
        >
          اذهب للمتجر →
        </Link>
      </div>
    </header>
  );
}
