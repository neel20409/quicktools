'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  FileArchive,
  FilePlus2,
  PenTool,
  FileText,
  Eraser,
  Minimize2,
  RefreshCcw,
  Maximize2,
  Music,
  Scissors,
  Video,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react';
import { TOOLS, CATEGORIES, ToolConfig } from '@/config/tools';
import { AdBanner } from '@/components/AdBanner';
import { JsonLd } from '@/components/JsonLd';

const ICON_MAP: Record<string, any> = {
  FileArchive,
  FilePlus2,
  PenTool,
  FileText,
  Eraser,
  Minimize2,
  RefreshCcw,
  Maximize2,
  Music,
  Scissors,
  Video,
};

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      <JsonLd type="website" />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-zinc-50/50 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 dark:opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Zero Server Uploads • 100% In-Browser Privacy</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-4xl mx-auto leading-tight mb-6">
            Free, Private Online Tools for{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PDF, Images & Media
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Compress files, merge PDFs, remove photo backgrounds, and convert video to MP3 directly on your computer. Fast, secure, and completely free.
          </p>

          {/* Live Search Bar */}
          <div className="max-w-xl mx-auto relative mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to do? (e.g. compress pdf, remove bg, mp4 to mp3)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-base bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 text-zinc-900 dark:text-white shadow-lg shadow-zinc-200/50 dark:shadow-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          {/* Top Leaderboard Ad */}
          <div className="flex justify-center">
            <AdBanner format="leaderboard" slot="home-top-leaderboard" />
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-700 dark:bg-zinc-200 text-white dark:text-zinc-900'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {cat.id === 'all'
                  ? TOOLS.length
                  : TOOLS.filter((t) => t.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => {
            const Icon = ICON_MAP[tool.icon] || Wrench;

            return (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group relative p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/80 dark:hover:border-indigo-500/80 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar inside card */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `${tool.accentColor}18`,
                        color: tool.accentColor,
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {tool.badge && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: `${tool.accentColor}15`,
                          color: tool.accentColor,
                        }}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1.5">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">
              No tools found matching &quot;{searchQuery}&quot;. Try searching for &quot;pdf&quot;, &quot;image&quot;, or &quot;audio&quot;.
            </p>
          </div>
        )}

        {/* Mid-Page Inline Ad */}
        <div className="mt-16 flex justify-center">
          <AdBanner format="inline" slot="home-mid-inline" />
        </div>
      </section>

      {/* Why QuickTools vs Competitors */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-3">
              Why Millions Prefer Client-Side Tools
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
              Traditional tools upload your private contracts, photos, and files to third-party cloud servers. QuickTools processes everything right inside your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">
                100% Private & Confidential
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Files are processed in device RAM using WebAssembly. Your sensitive tax forms, signatures, and personal photos are never transmitted over the internet.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">
                Zero Upload / Download Lag
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                No waiting 5 minutes for a 200MB video or PDF to upload to a remote server. Execution begins instantly with zero bandwidth waste.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">
                No Artificial File Limits
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                No paywalls, no &quot;2 files per day&quot; limits, and no registration forms. Unlimited utility for students, accountants, and creators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Leaderboard Ad */}
      <div className="py-12 flex justify-center">
        <AdBanner format="leaderboard" slot="home-bottom-leaderboard" />
      </div>
    </div>
  );
}
