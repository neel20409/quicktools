'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Search,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Volume2,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { TOOLS } from '@/config/tools';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredTools = searchQuery.trim()
    ? TOOLS.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
                QuickTools
              </span>
              <span className="text-[10px] font-semibold tracking-wide bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-1.5 py-0.5 rounded-full">
                FREE
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal -mt-0.5">
              100% In-Browser & Private
            </span>
          </div>
        </Link>

        {/* Global Instant Search */}
        <div className="relative hidden md:block flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Search tools (e.g. compress pdf, remove bg, mp3)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Search Dropdown Results */}
          {searchFocused && filteredTools.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 max-h-80 overflow-y-auto z-50">
              {filteredTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {tool.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {tool.tagline}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {tool.categoryName}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <Link
            href="/#pdf-tools"
            className="px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-red-500" />
            PDF Tools
          </Link>
          <Link
            href="/#image-tools"
            className="px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
          >
            <ImageIcon className="w-4 h-4 text-blue-500" />
            Image Tools
          </Link>
          <Link
            href="/#video-audio-tools"
            className="px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4 text-emerald-500" />
            Video & Audio
          </Link>
        </nav>

        {/* Security / Privacy Trust Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero Server Upload</span>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any tool..."
            className="w-full px-4 py-2 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
          />
          <div className="grid grid-cols-1 gap-1 text-sm font-medium">
            <Link
              href="/#pdf-tools"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-red-500" />
              PDF Tools
            </Link>
            <Link
              href="/#image-tools"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4 text-blue-500" />
              Image Tools
            </Link>
            <Link
              href="/#video-audio-tools"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-emerald-500" />
              Video & Audio Tools
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
