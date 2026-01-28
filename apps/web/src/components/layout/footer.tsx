export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 px-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-slate-600 dark:text-slate-400 md:text-left">
          Built with Next.js, Rust, and PostgreSQL. Data sourced from public domain mythology texts.
        </p>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          © 2025 Mythos Atlas
        </p>
      </div>
    </footer>
  );
}
