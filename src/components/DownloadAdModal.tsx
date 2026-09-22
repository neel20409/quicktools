'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { AdBanner } from './AdBanner';

interface DownloadAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  fileName: string;
  fileSize?: string;
}

export function DownloadAdModal({
  isOpen,
  onClose,
  onDownload,
  fileName,
  fileSize,
}: DownloadAdModalProps) {
  const [countdown, setCountdown] = useState(3);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      setReady(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadClick = () => {
    onDownload();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 overflow-hidden text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>File Processed Successfully</span>
        </div>

        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
          Your File is Ready!
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto truncate mb-4">
          {fileName} {fileSize && `(${fileSize})`}
        </p>

        {/* High-CPM Modal Ad Unit (Near 100% Viewability) */}
        <div className="my-3">
          <AdBanner format="sidebar" slot="download-modal-interstitial" />
        </div>

        {/* Countdown / Download Action */}
        <div className="pt-2">
          {countdown > 0 ? (
            <button
              onClick={handleDownloadClick}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Ready in {countdown}s (or click to download now)</span>
            </button>
          ) : (
            <button
              onClick={handleDownloadClick}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all animate-bounce"
            >
              <Download className="w-4 h-4" />
              <span>Click to Download Now</span>
            </button>
          )}

          <p className="text-[11px] text-zinc-400 mt-2">
            100% Free • Processed locally on your device
          </p>
        </div>
      </div>
    </div>
  );
}
