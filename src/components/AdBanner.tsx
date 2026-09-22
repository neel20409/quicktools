'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface AdBannerProps {
  slot?: string;
  format?: 'leaderboard' | 'sidebar' | 'inline' | 'in-tool';
  className?: string;
}

export function AdBanner({
  slot = 'default-slot',
  format = 'leaderboard',
  className = '',
}: AdBannerProps) {
  const isProd = process.env.NODE_ENV === 'production';
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  // Format classes & aspect ratios
  const formatStyles = {
    leaderboard: 'w-full max-w-[728px] min-h-[90px] h-[90px]',
    sidebar: 'w-full max-w-[300px] min-h-[250px] md:min-h-[600px]',
    inline: 'w-full max-w-[728px] min-h-[120px]',
    'in-tool': 'w-full max-w-[468px] min-h-[60px]',
  };

  return (
    <div
      className={`my-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 p-2 overflow-hidden transition-all ${className}`}
    >
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500 mb-1">
        <span>Advertisement</span>
        <Sparkles className="w-2.5 h-2.5 text-zinc-400" />
      </div>

      {adsenseId && isProd ? (
        // Live AdSense tag
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adsenseId}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        // Premium Mock Ad Container (visible in dev / before AdSense approval)
        <div
          className={`flex flex-col items-center justify-center text-center p-3 rounded-lg bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900/60 dark:to-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400 text-xs shadow-xs ${formatStyles[format]}`}
        >
          <div className="font-medium text-zinc-700 dark:text-zinc-300">
            Ad Space ({format})
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5 max-w-xs">
            Connect your Google AdSense ID in <code className="text-emerald-500">.env.local</code> to activate live ads
          </p>
        </div>
      )}
    </div>
  );
}
