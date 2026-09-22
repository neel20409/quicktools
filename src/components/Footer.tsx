import React from 'react';
import Link from 'next/link';
import { Wrench, ShieldCheck, Zap, Lock, Heart } from 'lucide-react';
import { TOOLS } from '@/config/tools';

export function Footer() {
  const pdfTools = TOOLS.filter((t) => t.category === 'pdf');
  const imageTools = TOOLS.filter((t) => t.category === 'image');
  const videoAudioTools = TOOLS.filter((t) => t.category === 'video-audio');

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 mt-auto pt-14 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Trust Banner */}
        <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white text-base">
                100% Client-Side Privacy Guarantee
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Your documents and media are processed on your local device CPU/GPU. No files are ever sent to remote servers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 shrink-0">
            <Lock className="w-4 h-4" />
            Zero Data Tracking
          </div>
        </div>

        {/* Categorized Tool Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-zinc-900 dark:text-white">
                QuickTools
              </span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
              Free, private, and unlimited online utilities for everyday productivity. Designed for speed, privacy, and simplicity.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Zap className="w-4 h-4 text-amber-500" />
              Powered by WebAssembly & Web APIs
            </div>
          </div>

          {/* PDF Suite Links */}
          <div>
            <h5 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">
              PDF Tools
            </h5>
            <ul className="space-y-2 text-sm">
              {pdfTools.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/tools/${t.slug}`}
                    className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Image Suite Links */}
          <div>
            <h5 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">
              Image Tools
            </h5>
            <ul className="space-y-2 text-sm">
              {imageTools.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/tools/${t.slug}`}
                    className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Video & Audio Suite Links */}
          <div>
            <h5 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3">
              Video & Audio Tools
            </h5>
            <ul className="space-y-2 text-sm">
              {videoAudioTools.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/tools/${t.slug}`}
                    className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} QuickTools. All rights reserved. Free for commercial & personal use.</p>
          <div className="flex items-center gap-1">
            <span>Built for high-speed client-side performance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
