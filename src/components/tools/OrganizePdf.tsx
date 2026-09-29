'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  RotateCw, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import confetti from 'canvas-confetti';
import { AdBanner } from '@/components/AdBanner';
import { DownloadAdModal } from '@/components/DownloadAdModal';
import { downloadBlob } from '@/lib/download';

interface PageItem {
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270
}

export function OrganizePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [organizedBlob, setOrganizedBlob] = useState<Blob | null>(null);
  const [organizedSize, setOrganizedSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (organizedBlob && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [organizedBlob]);

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
        const initialPages: PageItem[] = Array.from({ length: count }, (_, i) => ({
          originalIndex: i,
          rotation: pdfDoc.getPage(i).getRotation().angle || 0,
        }));
        setPages(initialPages);
        setFile(selected);
        setError(null);
        setOrganizedBlob(null);
      } catch (err) {
        setError('Could not read this PDF. It may be password protected.');
      }
    }
  };

  const rotatePage = (index: number) => {
    setPages((prev) => {
      const copy = [...prev];
      copy[index].rotation = (copy[index].rotation + 90) % 360;
      return copy;
    });
  };

  const rotateAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 })));
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      setError('A PDF must contain at least one page.');
      return;
    }
    setPages((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const movePage = (from: number, to: number) => {
    if (to < 0 || to >= pages.length) return;
    setPages((prev) => {
      const copy = [...prev];
      const item = copy.splice(from, 1)[0];
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const saveOrganizedPdf = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const targetPdf = await PDFDocument.create();

      for (const item of pages) {
        const [copiedPage] = await targetPdf.copyPages(sourcePdf, [item.originalIndex]);
        copiedPage.setRotation(degrees(item.rotation));
        targetPdf.addPage(copiedPage);
      }

      const pdfBytes = await targetPdf.save();
      const outputBlob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });

      setOrganizedBlob(outputBlob);
      setOrganizedSize(outputBlob.size);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error(err);
      setError('Failed to organize and export PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    if (!organizedBlob || !file) return;
    const cleanName = file.name.replace(/\.[^/.]+$/, '').trim();
    const finalName = `organized_${cleanName || 'document'}.pdf`;
    downloadBlob(organizedBlob, finalName, 'application/pdf');
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
            <LayoutGrid className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            Choose PDF file to Organize & Rotate
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            Reorder pages, rotate sideways pages, and delete unwanted pages visually with 1 tap.
          </p>
          <button className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-md transition-colors">
            Select PDF File
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Card */}
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
                  {pages.length} Pages • Tap rotate or reorder
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={rotateAll}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5"
                title="Rotate all pages clockwise"
              >
                <RotateCw className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">Rotate All</span>
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setOrganizedBlob(null);
                }}
                className="text-xs font-medium text-zinc-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-zinc-200/50 transition-colors"
              >
                Change
              </button>
            </div>
          </div>

          {/* Pages Grid */}
          {!organizedBlob && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
                {pages.map((p, idx) => (
                  <div
                    key={`${p.originalIndex}-${idx}`}
                    className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/40 flex flex-col justify-between"
                  >
                    {/* Page Bar */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => rotatePage(idx)}
                          className="p-1 rounded text-zinc-500 hover:text-red-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          title="Rotate 90° Clockwise"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePage(idx)}
                          className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Page Thumbnail Representation with CSS Rotation */}
                    <div className="w-full aspect-[3/4] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center p-3 relative overflow-hidden my-1 shadow-xs">
                      <div 
                        className="w-full h-full flex flex-col items-center justify-center transition-transform duration-200"
                        style={{ transform: `rotate(${p.rotation}deg)` }}
                      >
                        <FileText className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                        <span className="text-[10px] font-bold text-zinc-400 mt-1">Page {p.originalIndex + 1}</span>
                      </div>
                      {p.rotation > 0 && (
                        <span className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {p.rotation}°
                        </span>
                      )}
                    </div>

                    {/* Move Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => movePage(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-zinc-400">Position {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => movePage(idx, idx + 1)}
                        disabled={idx === pages.length - 1}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <AdBanner format="in-tool" slot="organize-pdf-inline" />

              {/* Action Button */}
              <button
                onClick={saveOrganizedPdf}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold text-sm shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Rebuilding PDF structure...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save {pages.length}-Page PDF</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Result Card */}
          {organizedBlob && (
            <>
              <div 
                ref={resultRef}
                className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PDF Organized Successfully!
                </div>

                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {pages.length} Pages Saved • {formatBytes(organizedSize)}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setShowDownloadModal(true)}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-colors active:scale-98"
                  >
                    <Download className="w-4 h-4 animate-bounce" />
                    Download Organized PDF
                  </button>
                  <button
                    onClick={() => setOrganizedBlob(null)}
                    className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
                  >
                    Re-edit Pages
                  </button>
                </div>

                <DownloadAdModal
                  isOpen={showDownloadModal}
                  onClose={() => setShowDownloadModal(false)}
                  onDownload={downloadFile}
                  fileName={`organized_${file?.name || 'document.pdf'}`}
                  fileSize={formatBytes(organizedSize)}
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
                    <span>Download PDF</span>
                  </span>
                  <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                    {pages.length} Pages
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
