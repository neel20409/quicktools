'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Heart, X } from 'lucide-react';

export function AdBlockNotice() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if previously dismissed in this session
    const isDismissed = sessionStorage.getItem('quicktools_adblock_dismissed');
    if (isDismissed) return;

    // Test bait element
    const bait = document.createElement('div');
    bait.className = 'adsbygoogle ad-banner pub_300x250 pub_728x90 text-ad';
    bait.style.position = 'absolute';
    bait.style.left = '-9999px';
    bait.style.top = '-9999px';
    bait.style.height = '100px';
    bait.style.width = '100px';
    document.body.appendChild(bait);

    const timer = setTimeout(() => {
      if (
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        bait.offsetLeft === 0 ||
        window.getComputedStyle(bait).display === 'none'
      ) {
        setAdBlockDetected(true);
      }
      if (bait.parentNode) bait.parentNode.removeChild(bait);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('quicktools_adblock_dismissed', '1');
  };

  if (!adBlockDetected || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-700 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <Heart className="w-4 h-4 fill-amber-400" />
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="text-xs font-bold text-zinc-100">
            Support Free Client-Side Tools
          </h4>
          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
            We noticed an ad blocker. QuickTools is 100% free and runs on your device without expensive servers. Please consider whitelisting us to help keep our tools free for everyone!
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zinc-400 hover:text-zinc-200 p-1"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
