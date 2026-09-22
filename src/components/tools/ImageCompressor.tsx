'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, ArrowDown, CheckCircle2, Download, RefreshCw, AlertCircle, Sliders } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import confetti from 'canvas-confetti';
import { AdBanner } from '@/components/AdBanner';

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selected: File) => {
    if (!selected.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, or WebP).');
      return;
    }
    setError(null);
    setFile(selected);
    setOriginalSize(selected.size);
    setPreviewUrl(URL.createObjectURL(selected));
    setCompressedBlob(null);
    setCompressedUrl(null);
  };

  const compress = async (overrideQuality?: number) => {
    if (!file) return;
    const targetQuality = overrideQuality ?? quality;
    setIsProcessing(true);
    setError(null);

    try {
      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: 2560,
        useWebWorker: true,
        initialQuality: targetQuality / 100,
      };

      const compressedFile = await imageCompression(file, options);
      setCompressedBlob(compressedFile);
      setCompressedSize(compressedFile.size);
      setCompressedUrl(URL.createObjectURL(compressedFile));

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error(err);
      setError('Could not compress this image. Try another file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!compressedBlob || !file) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(compressedBlob);
    a.download = `compressed_${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const savingsPercent = originalSize > 0 && compressedSize > 0
    ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
    : 0;

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
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            Drop photo here or click to browse
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            Supports JPG, PNG, and WebP. Instant compression up to 90% without losing clarity.
          </p>
          <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md transition-colors">
            Choose Image
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Header */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                  {file.name}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Original: {formatBytes(originalSize)}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setCompressedBlob(null);
              }}
              className="text-xs font-medium text-zinc-500 hover:text-blue-600"
            >
              Change image
            </button>
          </div>

          {/* Slider & Controls */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Target Quality: <span className="text-blue-600 font-bold">{quality}%</span>
              </label>
              <span className="text-xs text-zinc-400">
                {quality > 80 ? 'High Quality' : quality > 50 ? 'Recommended' : 'Maximum Savings'}
              </span>
            </div>

            <input
              type="range"
              min={10}
              max={95}
              value={quality}
              onChange={(e) => {
                const val = Number(e.target.value);
                setQuality(val);
              }}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
            />

            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Smallest File (10%)</span>
              <span>Balanced (75%)</span>
              <span>Crispest (95%)</span>
            </div>
          </div>

          <AdBanner format="in-tool" slot="img-compress-inline" />

          {/* Compress Button */}
          {!compressedBlob && (
            <button
              onClick={() => compress()}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compressing in browser...</span>
                </>
              ) : (
                <span>Compress Image Now</span>
              )}
            </button>
          )}

          {/* Result Card */}
          {compressedBlob && (
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Image Compressed!
              </div>

              <div className="flex items-center justify-center gap-6 my-2">
                <div>
                  <div className="text-xs text-zinc-500">Original</div>
                  <div className="text-sm font-semibold line-through text-zinc-500">
                    {formatBytes(originalSize)}
                  </div>
                </div>
                <div className="flex items-center text-emerald-600 font-bold text-sm bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-lg">
                  <ArrowDown className="w-3.5 h-3.5 mr-0.5" />
                  -{savingsPercent}%
                </div>
                <div>
                  <div className="text-xs text-zinc-500">New Size</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatBytes(compressedSize)}
                  </div>
                </div>
              </div>

              {/* Side-by-side or image preview */}
              {compressedUrl && (
                <div className="max-w-xs mx-auto rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm max-h-48">
                  <img
                    src={compressedUrl}
                    alt="Compressed output"
                    className="w-full h-full object-contain bg-zinc-100 dark:bg-zinc-800"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={downloadImage}
                  className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Compressed Image
                </button>
                <button
                  onClick={() => compress()}
                  className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
                >
                  Re-compress with New Quality
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
