'use client';

import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

interface AdBannerProps {
  slot?: string;
  slotId?: string;
  format?: 'leaderboard' | 'sidebar' | 'inline' | 'in-tool';
  className?: string;
}

export function AdBanner({
  slot,
  slotId,
  format = 'leaderboard',
  className = '',
}: AdBannerProps) {
  const isProd = process.env.NODE_ENV === 'production';
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-8023550227126773';
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  // Use slotId if numeric, else check slot. Only pass data-ad-slot if strictly numeric.
  const rawSlot = slotId || slot || '';
  const isNumericSlot = /^\d+$/.test(rawSlot.trim());

  // Format classes & aspect ratios
  const formatStyles = {
    leaderboard: 'w-full max-w-[728px] min-h-[90px]',
    sidebar: 'w-full max-w-[300px] min-h-[250px] md:min-h-[600px]',
    inline: 'w-full max-w-[728px] min-h-[120px]',
    'in-tool': 'w-full max-w-[468px] min-h-[60px]',
  };

  useEffect(() => {
    if (isProd && adsenseId && !pushedRef.current) {
      try {
        if (typeof window !== 'undefined') {
          ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
            (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
          pushedRef.current = true;
        }
      } catch (err) {
        console.error('AdSense push error:', err);
      }
    }
  }, [isProd, adsenseId]);

  return (
    <div
      className={`my-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 p-2 overflow-hidden transition-all ${className}`}
    >
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500 mb-1">
        <span>Advertisement</span>
        <Sparkles className="w-2.5 h-2.5 text-zinc-400" />
      </div>

      <div className={`flex items-center justify-center w-full ${formatStyles[format]}`}>
        {adsenseId && isProd ? (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: '60px' }}
            data-ad-client={adsenseId}
            {...(isNumericSlot ? { 'data-ad-slot': rawSlot.trim() } : {})}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div
            className={`flex flex-col items-center justify-center text-center p-3 rounded-lg bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900/60 dark:to-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400 text-xs shadow-xs w-full h-full`}
          >
            <div className="font-medium text-zinc-700 dark:text-zinc-300">
              Ad Space ({format})
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 max-w-xs">
              Live ads will appear here once approved by Google AdSense
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
