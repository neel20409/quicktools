'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Lock, Unlock, CheckCircle2, Download, RefreshCw, AlertCircle, Maximize2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdBanner } from '@/components/AdBanner';

export function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selected: File) => {
    if (!selected.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError(null);
    setFile(selected);

    const img = new Image();
    const url = URL.createObjectURL(selected);
    img.onload = () => {
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      URL.revokeObjectURL(url);
    };
    img.src = url;
    setResizedBlob(null);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspectRatio && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspectRatio && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  const applyPreset = (w: number, h: number) => {
    setLockAspectRatio(false);
    setWidth(w);
    setHeight(h);
  };

  const resizeImage = () => {
    if (!file || width <= 0 || height <= 0) return;
    setIsProcessing(true);
    setError(null);

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Canvas not supported');
        setIsProcessing(false);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          setResizedBlob(blob);
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        }
        setIsProcessing(false);
        URL.revokeObjectURL(url);
      }, file.type || 'image/jpeg', 0.92);
    };

    img.src = url;
  };

  const downloadResized = () => {
    if (!resizedBlob || !file) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(resizedBlob);
    a.download = `resized_${width}x${height}_${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden p-6 sm:p-8">
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          className="border-2 border-dashed border-blue-300 dark:border-blue-900/60 hover:border-blue-500 rounded-2xl p-10 sm:p-14 flex flex-col items-center justify-center text-center cursor-pointer bg-blue-50/20 dark:bg-blue-950/10 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Maximize2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            Upload photo to resize
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            Change pixel dimensions or choose presets for Instagram, YouTube, and Facebook.
          </p>
          <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md transition-colors">
            Choose Photo
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                  {file.name}
                </div>
                <div className="text-xs text-zinc-500">
                  Original Dimensions: {originalWidth} × {originalHeight} px
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResizedBlob(null);
              }}
              className="text-xs font-medium text-zinc-500 hover:text-blue-600"
            >
              Change file
            </button>
          </div>

          {!resizedBlob && (
            <div className="space-y-5">
              {/* Presets */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                  Social Media & Standard Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'Instagram Square', w: 1080, h: 1080 },
                    { name: 'Instagram Story', w: 1080, h: 1920 },
                    { name: 'YouTube Thumbnail', w: 1280, h: 720 },
                    { name: '50% Scale', w: Math.round(originalWidth * 0.5), h: Math.round(originalHeight * 0.5) },
                  ].map((p) => (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p.w, p.h)}
                      className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 text-left text-xs bg-zinc-50/50 dark:bg-zinc-800/40 transition-colors"
                    >
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {p.w} × {p.h} px
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Dimensions Inputs */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-zinc-500 mb-1 block">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm font-semibold"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setLockAspectRatio(!lockAspectRatio)}
                  className={`mt-5 p-2.5 rounded-xl border transition-colors ${
                    lockAspectRatio
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-600'
                      : 'border-zinc-200 text-zinc-400'
                  }`}
                  title={lockAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                >
                  {lockAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>

                <div className="flex-1">
                  <label className="text-xs font-medium text-zinc-500 mb-1 block">Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm font-semibold"
                  />
                </div>
              </div>

              <AdBanner format="in-tool" slot="img-resize-inline" />

              <button
                onClick={resizeImage}
                disabled={isProcessing || width <= 0 || height <= 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resizing image...</span>
                  </>
                ) : (
                  <span>Resize to {width} × {height} px</span>
                )}
              </button>
            </div>
          )}

          {resizedBlob && (
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resized to {width} × {height} px!
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={downloadResized}
                  className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Resized Image
                </button>
                <button
                  onClick={() => setResizedBlob(null)}
                  className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
                >
                  Resize Again
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
