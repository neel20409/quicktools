'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Scissors, 
  FileText, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Sparkles 
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import confetti from 'canvas-confetti';
import { AdBanner } from '@/components/AdBanner';
import { downloadBlob } from '@/lib/download';
import { DownloadAdModal } from '@/components/DownloadAdModal';

export function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<'range' | 'extract'>('range');
  const [pageRange, setPageRange] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitBlob, setSplitBlob] = useState<Blob | null>(null);
  const [splitSize, setSplitSize] = useState<number>(0);
  const [extractedCount, setExtractedCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (splitBlob && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [splitBlob]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
        setError('Please select a valid PDF file.');
        return;
      }
      try {
        const buffer = await selected.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = pdfDoc.getPageCount();
        setPageCount(count);
        setPageRange(count > 1 ? `1-${Math.min(count, 3)}` : '1');
        setFile(selected);
        setError(null);
        setSplitBlob(null);
      } catch (err) {
        setError('Could not read this PDF. It might be password protected.');
      }
    }
  };

  const parsePageNumbers = (input: string, max: number): number[] => {
    const pages = new Set<number>();
    const parts = input.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const from = Math.max(1, Math.min(start, end));
          const to = Math.min(max, Math.max(start, end));
          for (let p = from; p <= to; p++) pages.add(p);
        }
      } else {
        const single = parseInt(trimmed, 10);
        if (!isNaN(single) && single >= 1 && single <= max) {
          pages.add(single);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const splitPdf = async () => {
    if (!file || pageCount === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const selectedPages = parsePageNumbers(pageRange, pageCount);
      if (selectedPages.length === 0) {
        setError(`Please enter valid page numbers between 1 and ${pageCount}.`);
        setIsProcessing(false);
        return;
      }

      const buffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const targetPdf = await PDFDocument.create();

      // pdf-lib uses 0-indexed page numbers
      const pageIndices = selectedPages.map((p) => p - 1);
      const copiedPages = await targetPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach((page) => targetPdf.addPage(page));

      const pdfBytes = await targetPdf.save();
      const outputBlob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });

      setSplitBlob(outputBlob);
      setSplitSize(outputBlob.size);
      setExtractedCount(selectedPages.length);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error(err);
      setError('Failed to split PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    if (!splitBlob || !file) return;
    const cleanName = file.name.replace(/\.[^/.]+$/, '').trim();
    const finalName = `extracted_pages_${cleanName || 'document'}.pdf`;
    downloadBlob(splitBlob, finalName, 'application/pdf');
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
            <Scissors className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            Choose PDF file to Split or Extract Pages
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            Extract individual pages, separate chapters, or split contracts in 1 second with 100% privacy.
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
                  Total {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setSplitBlob(null);
              }}
              className="text-xs font-medium text-zinc-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors"
            >
              Change file
            </button>
          </div>

          {/* Page Range Selection */}
          {!splitBlob && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    Pages to Extract
                  </label>
                  <span className="text-xs text-zinc-400">
                    Document has {pageCount} pages
                  </span>
                </div>

                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPageRange('1')}
                    className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-red-500"
                  >
                    First Page Only
                  </button>
                  {pageCount > 1 && (
                    <button
                      type="button"
                      onClick={() => setPageRange(`1-${Math.min(pageCount, 5)}`)}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-red-500"
                    >
                      Pages 1 to {Math.min(pageCount, 5)}
                    </button>
                  )}
                  {pageCount > 1 && (
                    <button
                      type="button"
                      onClick={() => setPageRange(`${pageCount}`)}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-red-500"
                    >
                      Last Page Only
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPageRange(`1-${pageCount}`)}
                    className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-red-500"
                  >
                    All Pages
                  </button>
                </div>
              </div>

              <AdBanner format="in-tool" slot="split-pdf-inline" />

              {/* Action Button */}
              <button
                onClick={splitPdf}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold text-sm shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting selected pages...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract & Save Pages</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Result Card */}
          {splitBlob && (
            <>
              <div 
                ref={resultRef}
                className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pages Extracted Successfully!
                </div>

                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {extractedCount} {extractedCount === 1 ? 'Page' : 'Pages'} Extracted • {formatBytes(splitSize)}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setShowDownloadModal(true)}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-colors active:scale-98"
                  >
                    <Download className="w-4 h-4 animate-bounce" />
                    Download Extracted PDF
                  </button>
                  <button
                    onClick={() => setSplitBlob(null)}
                    className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
                  >
                    Split Again
                  </button>
                </div>

                <DownloadAdModal
                  isOpen={showDownloadModal}
                  onClose={() => setShowDownloadModal(false)}
                  onDownload={downloadFile}
                  fileName={`extracted_${file?.name || 'pages.pdf'}`}
                  fileSize={formatBytes(splitSize)}
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
                    <span>Download Extracted PDF</span>
                  </span>
                  <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                    {extractedCount} Pages
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
