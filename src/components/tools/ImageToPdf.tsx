'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Camera, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Plus, 
  Sparkles,
  FileText
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import confetti from 'canvas-confetti';
import { AdBanner } from '@/components/AdBanner';
import { DownloadAdModal } from '@/components/DownloadAdModal';
import { downloadBlob } from '@/lib/download';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  size: number;
}

export function ImageToPdf() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');
  const [margin, setMargin] = useState<'none' | 'small' | 'large'>('small');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfSize, setPdfSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on completion
  useEffect(() => {
    if (pdfBlob && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [pdfBlob]);

  const handleFiles = (fileList: FileList) => {
    const valid = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) {
      setError('Please select valid image files (JPG, PNG, WebP).');
      return;
    }
    setError(null);
    const newItems: ImageItem[] = valid.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      size: file.size,
    }));
    setImages((prev) => [...prev, ...newItems]);
    setPdfBlob(null);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      return filtered;
    });
    setPdfBlob(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgress(10);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const arrayBuffer = await item.file.arrayBuffer();

        let embeddedImage;
        try {
          if (item.file.type === 'image/jpeg' || item.file.type === 'image/jpg') {
            embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
          } else if (item.file.type === 'image/png') {
            embeddedImage = await pdfDoc.embedPng(arrayBuffer);
          } else {
            // Convert WebP / other formats via canvas to JPEG
            const img = new Image();
            img.src = item.previewUrl;
            await new Promise((res) => { img.onload = res; });
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            const jpegBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.92));
            const jpegBuffer = await jpegBlob.arrayBuffer();
            embeddedImage = await pdfDoc.embedJpg(jpegBuffer);
          }
        } catch (embedErr) {
          console.warn('Fallback embedding via canvas for:', item.file.name);
          const img = new Image();
          img.src = item.previewUrl;
          await new Promise((res) => { img.onload = res; });
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          const jpegBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.90));
          const jpegBuffer = await jpegBlob.arrayBuffer();
          embeddedImage = await pdfDoc.embedJpg(jpegBuffer);
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pageWidth = imgWidth;
        let pageHeight = imgHeight;
        let marginSize = margin === 'large' ? 40 : margin === 'small' ? 20 : 0;

        if (pageSize === 'a4') {
          pageWidth = 595.28;
          pageHeight = 841.89;
        } else if (pageSize === 'letter') {
          pageWidth = 612.0;
          pageHeight = 792.0;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        const availWidth = pageWidth - marginSize * 2;
        const availHeight = pageHeight - marginSize * 2;
        const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight);

        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;
        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });

        setProgress(Math.round(((i + 1) / images.length) * 80) + 10);
      }

      const pdfBytes = await pdfDoc.save();
      const outputBlob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });

      setPdfBlob(outputBlob);
      setPdfSize(outputBlob.size);
      setProgress(100);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate PDF from images. Please try with JPG or PNG.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    if (!pdfBlob) return;
    downloadBlob(pdfBlob, `images_converted_${Date.now()}.pdf`, 'application/pdf');
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
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        capture="environment"
        accept="image/*"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {images.length === 0 ? (
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-red-300 dark:border-red-900/60 hover:border-red-500 rounded-2xl p-10 sm:p-14 flex flex-col items-center justify-center text-center cursor-pointer bg-red-50/20 dark:bg-red-950/10 transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
              Choose photos or drag & drop here
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-5">
              Supports JPG, PNG, and WebP. Convert receipts, documents, and photos into a clean single PDF.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Select Photos
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4 text-red-600" />
                Scan with Camera
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-zinc-900 dark:text-white">
                  {images.length} {images.length === 1 ? 'Page' : 'Pages'} Selected
                </div>
                <div className="text-xs text-zinc-500">
                  Ready to compile into PDF
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">Camera</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add More
              </button>
            </div>
          </div>

          {/* PDF Page Layout Options */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full text-xs font-semibold p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
              >
                <option value="fit">Fit to Image Size</option>
                <option value="a4">Standard A4 Portrait</option>
                <option value="letter">US Letter</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                Margins
              </label>
              <select
                value={margin}
                onChange={(e) => setMargin(e.target.value as any)}
                className="w-full text-xs font-semibold p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
              >
                <option value="small">Small Margin (Clean)</option>
                <option value="none">No Margin (Full Bleed)</option>
                <option value="large">Large Margin (Document)</option>
              </select>
            </div>
          </div>

          {/* Reorderable Image Pages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
            {images.map((item, idx) => (
              <div
                key={item.id}
                className="relative rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 p-2.5 flex flex-col justify-between group"
              >
                {/* Page Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20"
                      title="Move Earlier"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(idx)}
                      disabled={idx === images.length - 1}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20"
                      title="Move Later"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="p-1 rounded text-zinc-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Thumbnail */}
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700 mb-2">
                  <img
                    src={item.previewUrl}
                    alt={`Page ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-[11px] text-zinc-500 truncate text-center">
                  {item.file.name}
                </div>
              </div>
            ))}
          </div>

          <AdBanner format="in-tool" slot="img-to-pdf-inline" />

          {/* Convert Action */}
          {!pdfBlob && (
            <button
              onClick={convertToPdf}
              disabled={isProcessing || images.length === 0}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold text-sm shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compiling PDF Document ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create PDF ({images.length} {images.length === 1 ? 'Page' : 'Pages'})</span>
                </>
              )}
            </button>
          )}

          {/* Result Card */}
          {pdfBlob && (
            <>
              <div 
                ref={resultRef}
                className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PDF Created Successfully!
                </div>

                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {images.length} Pages Compiled • {formatBytes(pdfSize)}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setShowDownloadModal(true)}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-colors active:scale-98"
                  >
                    <Download className="w-4 h-4 animate-bounce" />
                    Download Finished PDF
                  </button>
                  <button
                    onClick={() => {
                      setImages([]);
                      setPdfBlob(null);
                    }}
                    className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
                  >
                    Convert New Photos
                  </button>
                </div>

                <DownloadAdModal
                  isOpen={showDownloadModal}
                  onClose={() => setShowDownloadModal(false)}
                  onDownload={downloadFile}
                  fileName={`converted_document.pdf`}
                  fileSize={formatBytes(pdfSize)}
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
                    {images.length} Pages
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
