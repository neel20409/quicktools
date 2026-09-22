'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle2, Download, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdBanner } from '@/components/AdBanner';

export function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<'webp' | 'png' | 'jpeg'>('webp');
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selected: File) => {
    if (!selected.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    setError(null);
    setFile(selected);
    setConvertedBlob(null);
  };

  const convertImage = () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Canvas not supported');
        setIsProcessing(false);
        return;
      }

      // If converting to JPEG, draw white background behind transparent pixels
      if (targetFormat === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const mimeType = `image/${targetFormat}`;
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setConvertedBlob(blob);
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });
          } else {
            setError('Failed to encode image to selected format.');
          }
          setIsProcessing(false);
          URL.revokeObjectURL(objectUrl);
        },
        mimeType,
        0.92
      );
    };

    img.onerror = () => {
      setError('Failed to load image file.');
      setIsProcessing(false);
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  const downloadConverted = () => {
    if (!convertedBlob || !file) return;
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(convertedBlob);
    a.download = `${nameWithoutExt}.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`;
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
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            Upload image to convert format
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            Convert PNG to WebP, JPG to PNG, or WebP to JPG. 100% private in your browser.
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
                  Current format: {file.type.replace('image/', '').toUpperCase()}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setConvertedBlob(null);
              }}
              className="text-xs font-medium text-zinc-500 hover:text-blue-600"
            >
              Change file
            </button>
          </div>

          {!convertedBlob && (
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Choose Target Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'webp', name: 'WebP', desc: 'Recommended (Ultra Lightweight)' },
                  { id: 'png', name: 'PNG', desc: 'Preserves Transparency' },
                  { id: 'jpeg', name: 'JPG', desc: 'Universal Compatibility' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setTargetFormat(fmt.id as any)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      targetFormat === fmt.id
                        ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="font-bold text-base text-zinc-900 dark:text-white">
                      .{fmt.id === 'jpeg' ? 'jpg' : fmt.id}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      {fmt.desc}
                    </div>
                  </button>
                ))}
              </div>

              <AdBanner format="in-tool" slot="img-convert-inline" />

              <button
                onClick={convertImage}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <span>Convert to {targetFormat.toUpperCase()}</span>
                )}
              </button>
            </div>
          )}

          {convertedBlob && (
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Converted Successfully!
              </div>

              <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Ready to download as <span className="text-emerald-600 font-bold">.{targetFormat === 'jpeg' ? 'jpg' : targetFormat}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={downloadConverted}
                  className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Converted Image
                </button>
                <button
                  onClick={() => setConvertedBlob(null)}
                  className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
                >
                  Convert to Another Format
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
