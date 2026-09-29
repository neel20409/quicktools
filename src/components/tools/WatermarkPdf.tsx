'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Stamp, 
  FileText, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import confetti from 'canvas-confetti';
import { AdBanner } from '@/components/AdBanner';
import { DownloadAdModal } from '@/components/DownloadAdModal';
import { downloadBlob } from '@/lib/download';

export function WatermarkPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [opacity, setOpacity] = useState<number>(30); // 10% to 100%
  const [rotation, setRotation] = useState<number>(45); // 0 or 45
  const [color, setColor] = useState<'red' | 'gray' | 'blue'>('red');
  const [fontSize, setFontSize] = useState<number>(48);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkedBlob, setWatermarkedBlob] = useState<Blob | null>(null);
  const [watermarkedSize, setWatermarkedSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (watermarkedBlob && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [watermarkedBlob]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
        setError('Please select a valid PDF file.');
        return;
      }
      setError(null);
      setFile(selected);
      setWatermarkedBlob(null);
    }
  };

  const applyWatermark = async () => {
    if (!file || !watermarkText.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      // Resolve color
      let r = 0.85, g = 0.15, b = 0.15;
      if (color === 'gray') { r = 0.5; g = 0.5; b = 0.5; }
      else if (color === 'blue') { r = 0.15; g = 0.35; b = 0.85; }

      const alpha = opacity / 100;

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        // Center calculation
        const x = (width - textWidth) / 2;
        const y = (height - textHeight) / 2;

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity: alpha,
          rotate: degrees(rotation),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const outputBlob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });

      setWatermarkedBlob(outputBlob);
      setWatermarkedSize(outputBlob.size);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error(err);
      setError('Failed to watermark PDF. The file may be encrypted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    if (!watermarkedBlob || !file) return;
    const cleanName = file.name.replace(/\.[^/.]+$/, '').trim();
    const finalName = `watermarked_${cleanName || 'document'}.pdf`;
    downloadBlob(watermarkedBlob, finalName, 'application/pdf');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden p-6 sm:p-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              const f = e.dataTransfer.files[0];
              const event = { target: { files: [f] } } as any;
              handleFileChange(event);
            }
          }}
          className="border-2 border-dashed border-red-300 dark:border-red-900/60 hover:border-red-500 rounded-2xl p-10 sm:p-14 flex flex-col items-center justify-center text-center cursor-pointer bg-red-50/20 dark:bg-red-950/10 transition-all group"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Stamp className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            Choose PDF file to Watermark
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            Protect confidential documents with custom text stamps, opacity control, and diagonal watermarks.
          </p>
          <button className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-md transition-colors">
            Select PDF File
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Card Header */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                  {file.name}
                </div>
                <div className="text-xs text-zinc-500">
                  Ready to stamp watermark
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setWatermarkedBlob(null);
              }}
              className="text-xs font-medium text-zinc-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-zinc-200/50 transition-colors"
            >
              Change file
            </button>
          </div>

          {!watermarkedBlob && (
            <div className="space-y-4">
              {/* Text Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['CONFIDENTIAL', 'DRAFT', 'SAMPLE', 'COPY', 'PRIVATE'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWatermarkText(preset)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                        watermarkText === preset
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 font-bold'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Opacity */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">
                    <span>Opacity</span>
                    <span className="text-red-600">{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                {/* Rotation */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1.5">Angle</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation(45)}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                        rotation === 45
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600'
                      }`}
                    >
                      45° Diagonal
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation(0)}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                        rotation === 0
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600'
                      }`}
                    >
                      0° Flat
                    </button>
                  </div>
                </div>

                {/* Color */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1.5">Stamp Color</span>
                  <div className="flex gap-2">
                    {(['red', 'gray', 'blue'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`flex-1 py-1 text-xs font-semibold capitalize rounded-lg border transition-colors ${
                          color === c
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <AdBanner format="in-tool" slot="watermark-pdf-inline" />

              {/* Action Button */}
              <button
                onClick={applyWatermark}
                disabled={isProcessing || !watermarkText.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold text-sm shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Stamping document pages...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Apply Watermark to All Pages</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Result Card */}
          {watermarkedBlob && (
            <>
              <div 
                ref={resultRef}
                className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Watermark Applied Successfully!
                </div>

                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Stamped with &quot;{watermarkText}&quot; • {formatBytes(watermarkedSize)}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setShowDownloadModal(true)}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-colors active:scale-98"
                  >
                    <Download className="w-4 h-4 animate-bounce" />
                    Download Watermarked PDF
                  </button>
                  <button
                    onClick={() => setWatermarkedBlob(null)}
                    className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
                  >
                    Change Watermark
                  </button>
                </div>

                <DownloadAdModal
                  isOpen={showDownloadModal}
                  onClose={() => setShowDownloadModal(false)}
                  onDownload={downloadFile}
                  fileName={`watermarked_${file?.name || 'document.pdf'}`}
                  fileSize={formatBytes(watermarkedSize)}
                />
              </div>

              {/* Floating Sticky Mobile Download Bar */}
              <div className="sm:hidden fixed bottom-4 inset-x-4 z-40 animate-in slide-in-from-bottom-5 duration-300">
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(true)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold text-sm shadow-[0_10px_25px_rgba(5,150,105,0.45)] flex items-center justify-between border border-emerald-400/40 active:scale-95 transition-transform"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 animate-bounce" />
                    <span>Download Watermarked PDF</span>
                  </span>
                  <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                    Ready
                  </span>
                </button>
              </div>
            </>
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
