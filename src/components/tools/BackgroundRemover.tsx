'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Eraser, CheckCircle2, Download, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdBanner } from '@/components/AdBanner';

export function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [bgType, setBgType] = useState<'transparent' | 'white' | 'blur'>('transparent');
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
    setOriginalUrl(URL.createObjectURL(selected));
    setProcessedUrl(null);
    setProcessedBlob(null);
  };

  const removeBackground = () => {
    if (!file || !originalUrl) return;
    setIsProcessing(true);
    setError(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Canvas not supported');
          setIsProcessing(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample corner colors to detect background hue/luminance
        const samplePoints = [
          [0, 0],
          [canvas.width - 1, 0],
          [0, canvas.height - 1],
          [canvas.width - 1, canvas.height - 1],
        ];

        let avgR = 0, avgG = 0, avgB = 0;
        samplePoints.forEach(([x, y]) => {
          const idx = (y * canvas.width + x) * 4;
          avgR += data[idx];
          avgG += data[idx + 1];
          avgB += data[idx + 2];
        });
        avgR /= samplePoints.length;
        avgG /= samplePoints.length;
        avgB /= samplePoints.length;

        // High precision color distance thresholding for clean cutout
        const threshold = 48;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const dist = Math.sqrt(
            Math.pow(r - avgR, 2) + Math.pow(g - avgG, 2) + Math.pow(b - avgB, 2)
          );

          if (dist < threshold) {
            // Background pixel
            if (bgType === 'transparent') {
              data[i + 3] = 0; // Alpha 0
            } else if (bgType === 'white') {
              data[i] = 255;
              data[i + 1] = 255;
              data[i + 2] = 255;
            }
          } else if (dist < threshold + 12) {
            // Soft anti-aliased edge smoothing
            if (bgType === 'transparent') {
              const alphaRatio = (dist - threshold) / 12;
              data[i + 3] = Math.round(data[i + 3] * alphaRatio);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            setProcessedBlob(blob);
            setProcessedUrl(URL.createObjectURL(blob));
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.7 },
            });
          }
          setIsProcessing(false);
        }, 'image/png');
      } catch (err: any) {
        console.error(err);
        setError('Error isolating background. Try a photo with distinct contrast.');
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setError('Failed to load image.');
      setIsProcessing(false);
    };

    img.src = originalUrl;
  };

  const downloadPng = () => {
    if (!processedBlob || !file) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(processedBlob);
    a.download = `nobg_${file.name.replace(/\.[^/.]+$/, '')}.png`;
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
            <Eraser className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            Drop photo to remove background
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            100% free with zero watermarks. Transparent PNG output processed in your browser.
          </p>
          <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md transition-colors">
            Choose Photo
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <div className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
              {file.name}
            </div>
            <button
              onClick={() => {
                setFile(null);
                setProcessedUrl(null);
              }}
              className="text-xs font-medium text-zinc-500 hover:text-blue-600"
            >
              Change file
            </button>
          </div>

          {!processedUrl && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBgType('transparent')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    bgType === 'transparent'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'
                  }`}
                >
                  Transparent PNG
                </button>
                <button
                  onClick={() => setBgType('white')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    bgType === 'white'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'
                  }`}
                >
                  Pure White Background
                </button>
              </div>

              {originalUrl && (
                <div className="max-h-60 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 flex items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-2">
                  <img
                    src={originalUrl}
                    alt="Original preview"
                    className="max-h-56 object-contain rounded-xl"
                  />
                </div>
              )}

              <AdBanner format="in-tool" slot="bg-remove-inline" />

              <button
                onClick={removeBackground}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Erasing background...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Erase Background Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          {processedUrl && (
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Background Erased Cleanly!
              </div>

              {/* Checkerboard transparent preview */}
              <div
                className="max-h-72 rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700 p-4 flex items-center justify-center shadow-inner"
                style={{
                  backgroundImage:
                    'repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%)',
                  backgroundSize: '16px 16px',
                }}
              >
                <img
                  src={processedUrl}
                  alt="Background removed output"
                  className="max-h-64 object-contain drop-shadow-md"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={downloadPng}
                  className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Transparent PNG
                </button>
                <button
                  onClick={() => setProcessedUrl(null)}
                  className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
                >
                  Adjust
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
