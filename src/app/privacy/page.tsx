import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Eye, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | QuickTools Private File Suite',
  description: 'Learn how QuickTools ensures 100% private in-browser client-side file compression and conversion with zero server uploads.',
};

export default function PrivacyPolicyPage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Private Client-Side Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
          At QuickTools, privacy is not an afterthought — it is our core engineering foundation. Unlike conventional online PDF and image converters, QuickTools executes all file processing directly in your browser using WebAssembly and client-side JavaScript.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
          <Lock className="w-4 h-4" />
          <h2 className="text-lg">1. Zero Server Uploads (Your Files Stay On Your Device)</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          When you compress a PDF, resize an image, or convert MP4 to MP3, your files are processed completely in your computer or phone memory using client-side libraries (<code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs">pdf-lib</code>, <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs">browser-image-compression</code>, and HTML5 Canvas). No document, picture, or video is ever uploaded to any cloud server.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
          <Eye className="w-4 h-4" />
          <h2 className="text-lg">2. Advertising & Cookies</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          QuickTools is supported by third-party advertising partners (such as Google AdSense). Google uses cookies (including DART cookies) to serve relevant advertisements based on visits to this and other websites. You may opt out of personalized advertising by visiting Google Ads Settings.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
        <h2 className="text-lg font-bold">3. Contact Us</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          For privacy inquiries or technical questions regarding client-side processing, reach us at:
        </p>
        <p className="text-indigo-600 dark:text-indigo-400 font-mono text-sm font-semibold">
          privacy@quicktools.app
        </p>
      </section>
    </div>
  );
}
