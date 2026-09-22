import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | QuickTools',
  description: 'Terms and conditions for using QuickTools free in-browser file utility suite.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tools</span>
      </Link>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono">
          <Scale className="w-3.5 h-3.5" />
          <span>Usage Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
          By accessing and using QuickTools, you acknowledge and agree to the following terms.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
        <h2 className="text-lg font-bold">1. Free Personal & Commercial License</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          QuickTools is 100% free for both personal and commercial use. There are no file quantity restrictions, paywalls, or hidden watermarks added to your documents.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
        <h2 className="text-lg font-bold">2. Disclaimer of Warranty</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          QuickTools is provided &quot;as is&quot; without warranty of any kind. While all tools use industry-standard client-side processing algorithms, users are advised to retain original backups of crucial documents before compression or conversion.
        </p>
      </section>
    </div>
  );
}
