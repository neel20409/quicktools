'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, ArrowDown, Sparkles, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { PDFDocument, PDFName, PDFNumber, PDFRawStream, PDFRef } from 'pdf-lib';
import { inflate } from 'pako';
import confetti from 'canvas-confetti';
import { AdBanner } from '@/components/AdBanner';
import { DownloadAdModal } from '@/components/DownloadAdModal';
import { downloadBlob } from '@/lib/download';

function resolveVal(val: any, context: any): any {
  if (val && val instanceof PDFRef) {
    return context.lookup(val);
  }
  return val;
}

function unfilterPng(
  inflated: Uint8Array,
  width: number,
  height: number,
  colors: number
): Uint8Array | null {
  const bytesPerPixel = colors;
  const rowBytes = width * bytesPerPixel;
  const stride = rowBytes + 1;
  if (inflated.length < stride * height) return null;

  const out = new Uint8Array(width * height * bytesPerPixel);
  let prevRow = new Uint8Array(rowBytes);

  for (let y = 0; y < height; y++) {
    const rowStart = y * stride;
    const filterType = inflated[rowStart];
    const curRow = new Uint8Array(rowBytes);

    for (let x = 0; x < rowBytes; x++) {
      const raw = inflated[rowStart + 1 + x];
      const left = x >= bytesPerPixel ? curRow[x - bytesPerPixel] : 0;
      const up = prevRow[x];
      const upLeft = x >= bytesPerPixel ? prevRow[x - bytesPerPixel] : 0;

      let val = raw;
      if (filterType === 0) {
        val = raw;
      } else if (filterType === 1) {
        val = (raw + left) & 0xff;
      } else if (filterType === 2) {
        val = (raw + up) & 0xff;
      } else if (filterType === 3) {
        val = (raw + Math.floor((left + up) / 2)) & 0xff;
      } else if (filterType === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        let pr = left;
        if (pb < pa) pr = up;
        if (pc < Math.min(pa, pb)) pr = upLeft;
        val = (raw + pr) & 0xff;
      }
      curRow[x] = val;
      out[y * rowBytes + x] = val;
    }
    prevRow = curRow;
  }
  return out;
}

function unfilterTiff(
  inflated: Uint8Array,
  width: number,
  height: number,
  colors: number
): Uint8Array {
  const out = new Uint8Array(inflated);
  for (let y = 0; y < height; y++) {
    const rowStart = y * width * colors;
    for (let x = colors; x < width * colors; x++) {
      out[rowStart + x] = (out[rowStart + x] + out[rowStart + x - colors]) & 0xff;
    }
  }
  return out;
}

async function compressJpegBuffer(
  jpegBytes: Uint8Array,
  maxDimension: number,
  quality: number
): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
  if (typeof window === 'undefined') return null;

  return new Promise((resolve) => {
    try {
      const blob = new Blob([jpegBytes as Uint8Array<ArrayBuffer>], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(url);
        try {
          let { naturalWidth: width, naturalHeight: height } = img;
          if (!width || !height) {
            resolve(null);
            return;
          }

          let targetWidth = width;
          let targetHeight = height;

          if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            targetWidth = Math.max(1, Math.round(width * ratio));
            targetHeight = Math.max(1, Math.round(height * ratio));
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          canvas.toBlob(
            async (compressedBlob) => {
              if (!compressedBlob) {
                resolve(null);
                return;
              }
              try {
                const buffer = await compressedBlob.arrayBuffer();
                const newBytes = new Uint8Array(buffer);
                if (newBytes.length < jpegBytes.length) {
                  resolve({ bytes: newBytes, width: targetWidth, height: targetHeight });
                } else {
                  resolve(null);
                }
              } catch {
                resolve(null);
              }
            },
            'image/jpeg',
            quality
          );
        } catch {
          resolve(null);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };

      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

async function compressFlateBuffer(
  obj: PDFRawStream,
  maxDimension: number,
  quality: number,
  context: any
): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
  if (typeof window === 'undefined') return null;

  try {
    const widthVal = resolveVal(obj.dict.get(PDFName.of('Width')), context);
    const heightVal = resolveVal(obj.dict.get(PDFName.of('Height')), context);
    const width = widthVal instanceof PDFNumber ? widthVal.asNumber() : parseInt(widthVal?.toString() || '0', 10);
    const height = heightVal instanceof PDFNumber ? heightVal.asNumber() : parseInt(heightVal?.toString() || '0', 10);

    if (!width || !height || width <= 0 || height <= 0) return null;

    let inflated: Uint8Array;
    try {
      inflated = inflate(obj.contents);
    } catch {
      return null;
    }

    let colors = 3;
    let isPng = false;
    let isTiff = false;

    const decodeParms = resolveVal(obj.dict.get(PDFName.of('DecodeParms')), context);
    let predictorNum = 1;
    if (decodeParms && decodeParms.get) {
      const pred = resolveVal(decodeParms.get(PDFName.of('Predictor')), context);
      if (pred) {
        predictorNum = pred instanceof PDFNumber ? pred.asNumber() : parseInt(pred.toString(), 10) || 1;
      }
    }

    if (inflated.length === width * height * 3) {
      colors = 3;
      isPng = false;
    } else if (inflated.length === (width * 3 + 1) * height) {
      colors = 3;
      isPng = true;
    } else if (inflated.length === width * height) {
      colors = 1;
      isPng = false;
    } else if (inflated.length === (width + 1) * height) {
      colors = 1;
      isPng = true;
    } else if (inflated.length === width * height * 4) {
      colors = 4;
      isPng = false;
    } else if (inflated.length === (width * 4 + 1) * height) {
      colors = 4;
      isPng = true;
    } else if (predictorNum >= 10) {
      const expectedStride = inflated.length / height;
      const detectedColors = Math.round((expectedStride - 1) / width);
      if (detectedColors === 1 || detectedColors === 3 || detectedColors === 4) {
        colors = detectedColors;
        isPng = true;
      } else {
        return null;
      }
    } else if (predictorNum === 2) {
      isTiff = true;
      const cs = resolveVal(obj.dict.get(PDFName.of('ColorSpace')), context)?.toString() || '';
      if (cs.includes('Gray')) colors = 1;
      else if (cs.includes('CMYK')) colors = 4;
      else colors = 3;
    } else {
      const cs = resolveVal(obj.dict.get(PDFName.of('ColorSpace')), context)?.toString() || '';
      if (cs.includes('Gray')) colors = 1;
      else if (cs.includes('CMYK')) colors = 4;
      else colors = 3;

      if (inflated.length < width * height * colors) {
        return null;
      }
    }

    let rawPixels = inflated;
    if (isPng) {
      const unfilt = unfilterPng(inflated, width, height, colors);
      if (!unfilt) return null;
      rawPixels = unfilt;
    } else if (isTiff) {
      rawPixels = unfilterTiff(inflated, width, height, colors);
    }

    const imgData = new ImageData(width, height);
    const data = imgData.data;
    const totalPixels = width * height;

    if (colors === 3) {
      let srcIdx = 0;
      let dstIdx = 0;
      for (let i = 0; i < totalPixels; i++) {
        data[dstIdx] = rawPixels[srcIdx];
        data[dstIdx + 1] = rawPixels[srcIdx + 1];
        data[dstIdx + 2] = rawPixels[srcIdx + 2];
        data[dstIdx + 3] = 255;
        srcIdx += 3;
        dstIdx += 4;
      }
    } else if (colors === 1) {
      let dstIdx = 0;
      for (let i = 0; i < totalPixels; i++) {
        const g = rawPixels[i];
        data[dstIdx] = g;
        data[dstIdx + 1] = g;
        data[dstIdx + 2] = g;
        data[dstIdx + 3] = 255;
        dstIdx += 4;
      }
    } else if (colors === 4) {
      let srcIdx = 0;
      let dstIdx = 0;
      for (let i = 0; i < totalPixels; i++) {
        const c = rawPixels[srcIdx] / 255;
        const m = rawPixels[srcIdx + 1] / 255;
        const y = rawPixels[srcIdx + 2] / 255;
        const k = rawPixels[srcIdx + 3] / 255;
        data[dstIdx] = Math.round(255 * (1 - c) * (1 - k));
        data[dstIdx + 1] = Math.round(255 * (1 - m) * (1 - k));
        data[dstIdx + 2] = Math.round(255 * (1 - y) * (1 - k));
        data[dstIdx + 3] = 255;
        srcIdx += 4;
        dstIdx += 4;
      }
    }

    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = width;
    srcCanvas.height = height;
    const srcCtx = srcCanvas.getContext('2d');
    if (!srcCtx) return null;
    srcCtx.putImageData(imgData, 0, 0);

    let targetCanvas = srcCanvas;
    let targetWidth = width;
    let targetHeight = height;

    if (width > maxDimension || height > maxDimension) {
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      targetWidth = Math.max(1, Math.round(width * ratio));
      targetHeight = Math.max(1, Math.round(height * ratio));

      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = targetWidth;
      scaledCanvas.height = targetHeight;
      const scaledCtx = scaledCanvas.getContext('2d');
      if (!scaledCtx) return null;
      scaledCtx.drawImage(srcCanvas, 0, 0, targetWidth, targetHeight);
      targetCanvas = scaledCanvas;
    }

    return new Promise((resolve) => {
      targetCanvas.toBlob(
        async (compressedBlob) => {
          if (!compressedBlob) {
            resolve(null);
            return;
          }
          try {
            const buf = await compressedBlob.arrayBuffer();
            const newBytes = new Uint8Array(buf);
            if (newBytes.length < obj.contents.length) {
              resolve({ bytes: newBytes, width: targetWidth, height: targetHeight });
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        },
        'image/jpeg',
        quality
      );
    });
  } catch {
    return null;
  }
}

export function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<'ultra' | 'extreme' | 'recommended' | 'light'>('extreme');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('compressed_document.pdf');

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  // Auto-scroll to result card immediately when compression completes
  useEffect(() => {
    if (compressedBlob && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const timer = setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [compressedBlob]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
        setError('Please select a valid PDF file.');
        return;
      }
      setError(null);
      setFile(selected);
      setOriginalSize(selected.size);
      setCompressedBlob(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(15);

    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(25);

      // Load PDF via pdf-lib
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      setProgress(35);

      // Strip unnecessary metadata to reduce overhead
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('QuickTools Client Optimizer');
      pdfDoc.setCreator('QuickTools');

      // Compression targets for embedded raster images
      const maxDim =
        compressionLevel === 'ultra' ? 1200 :
        compressionLevel === 'extreme' ? 1400 :
        compressionLevel === 'recommended' ? 1800 : 2400;

      const quality =
        compressionLevel === 'ultra' ? 0.38 :
        compressionLevel === 'extreme' ? 0.48 :
        compressionLevel === 'recommended' ? 0.65 : 0.80;

      // Extract and compress embedded raster images (both JPEG DCTDecode and FlateDecode bitmaps)
      const indirectObjects = pdfDoc.context.enumerateIndirectObjects();
      const imageObjects: Array<{ obj: PDFRawStream; type: 'jpeg' | 'flate' }> = [];

      for (const [ref, obj] of indirectObjects) {
        if (obj instanceof PDFRawStream && obj.dict) {
          const subtype = resolveVal(obj.dict.get(PDFName.of('Subtype')), pdfDoc.context);
          if (subtype && subtype.toString() === '/Image') {
            const rawFilter = resolveVal(obj.dict.get(PDFName.of('Filter')), pdfDoc.context);
            const filterStr = rawFilter ? rawFilter.toString() : '';

            const isJpeg =
              filterStr.includes('DCTDecode') ||
              (obj.contents && obj.contents.length > 2 && obj.contents[0] === 0xff && obj.contents[1] === 0xd8);

            const isFlate = filterStr.includes('FlateDecode');

            // Skip tiny icons / spacers under 4KB
            if (obj.contents && obj.contents.length > 4096) {
              if (isJpeg) {
                imageObjects.push({ obj, type: 'jpeg' });
              } else if (isFlate) {
                imageObjects.push({ obj, type: 'flate' });
              }
            }
          }
        }
      }

      if (imageObjects.length > 0) {
        for (let i = 0; i < imageObjects.length; i++) {
          const { obj, type } = imageObjects[i];
          let res: { bytes: Uint8Array; width: number; height: number } | null = null;

          if (type === 'jpeg') {
            res = await compressJpegBuffer(obj.contents, maxDim, quality);
          } else if (type === 'flate') {
            res = await compressFlateBuffer(obj, maxDim, quality, pdfDoc.context);
          }

          if (res) {
            (obj as any).contents = res.bytes;
            obj.dict.set(PDFName.of('Length'), PDFNumber.of(res.bytes.length));
            obj.dict.set(PDFName.of('Width'), PDFNumber.of(res.width));
            obj.dict.set(PDFName.of('Height'), PDFNumber.of(res.height));
            obj.dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
            obj.dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'));
            obj.dict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));
            obj.dict.delete(PDFName.of('DecodeParms'));
            obj.dict.delete(PDFName.of('Decode'));
          }

          setProgress(35 + Math.round(((i + 1) / imageObjects.length) * 55));
          if (i % 3 === 0) {
            await new Promise((r) => setTimeout(r, 0));
          }
        }
      } else {
        setProgress(85);
      }

      setProgress(92);

      // Save with object stream compression
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      setProgress(98);

      const resultBlob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      setCompressedBlob(resultBlob);

      const cleanName = (file?.name || 'document').replace(/\.[^/.]+$/, '').trim().replace(/[\\/:*?"<>|]/g, '_');
      const finalName = `compressed_${cleanName || 'document'}.pdf`;
      const fileObj = new File([resultBlob], finalName, { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(fileObj);
      setDownloadUrl(objectUrl);
      setDownloadFilename(finalName);

      // ALWAYS set the true, real size of the actual downloaded file!
      setCompressedSize(resultBlob.size);
      setProgress(100);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error(err);
      setError('Could not compress this PDF. The file may be password protected or corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    if (!compressedBlob || !file) return;
    downloadBlob(compressedBlob, downloadFilename, 'application/pdf');
  };

  const reset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setFile(null);
    setCompressedBlob(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const savingsPercent = originalSize > 0 && compressedSize > 0
    ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
    : 0;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden p-4 sm:p-8">
      {!file ? (
        // Dropzone
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              const dropped = e.dataTransfer.files[0];
              if (dropped.type === 'application/pdf' || dropped.name.endsWith('.pdf')) {
                setFile(dropped);
                setOriginalSize(dropped.size);
              } else {
                setError('Please drop a valid PDF file.');
              }
            }
          }}
          className="border-2 border-dashed border-red-300 dark:border-red-900/60 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-8 sm:p-14 flex flex-col items-center justify-center text-center cursor-pointer bg-red-50/20 dark:bg-red-950/10 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-1">
            Choose PDF file or drag & drop here
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            Processed 100% locally on your computer. Your document is never uploaded anywhere.
          </p>
          <button className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-md transition-colors">
            Select PDF File
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* File Card Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white truncate">
                  {file.name}
                </div>
                <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                  Original: {formatBytes(originalSize)}
                </div>
              </div>
            </div>
            <button
              onClick={reset}
              className="text-xs font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors shrink-0"
            >
              Change file
            </button>
          </div>

          {/* Result Card: Directly visible at the top as soon as compression finishes */}
          {compressedBlob && (
            <div 
              ref={resultRef}
              className="p-5 sm:p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 text-center space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Successfully Compressed!
              </div>

              <div className="flex items-center justify-center gap-4 sm:gap-8 my-2">
                <div>
                  <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">Original</div>
                  <div className="text-sm sm:text-base font-semibold text-zinc-700 dark:text-zinc-300 line-through">
                    {formatBytes(originalSize)}
                  </div>
                </div>
                <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-lg">
                  <ArrowDown className="w-3.5 h-3.5 mr-0.5" />
                  -{savingsPercent}%
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">Compressed</div>
                  <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatBytes(compressedSize)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <a
                  href={downloadUrl || '#'}
                  download={downloadFilename}
                  onClick={(e) => {
                    if (!downloadUrl) {
                      e.preventDefault();
                      downloadFile();
                    } else if ('showSaveFilePicker' in window && compressedBlob) {
                      e.preventDefault();
                      downloadFile();
                    }
                  }}
                  className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer text-center"
                >
                  <Download className="w-4 h-4 animate-bounce" />
                  Download Compressed PDF
                </a>
                <button
                  onClick={reset}
                  className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
                >
                  Compress Another
                </button>
              </div>

              {/* Interstitial Download Modal */}
              <DownloadAdModal
                isOpen={showDownloadModal}
                onClose={() => setShowDownloadModal(false)}
                onDownload={downloadFile}
                fileName={`compressed_${file?.name || 'document.pdf'}`}
                fileSize={formatBytes(compressedSize)}
              />
            </div>
          )}

          {/* Compression Level Selector */}
          {!compressedBlob && (
            <div className="space-y-2.5 sm:space-y-3">
              <label className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Select Compression Strength
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    id: 'ultra',
                    title: 'Ultra Max',
                    desc: 'Smallest file, 80%+ off',
                    badge: '85% off',
                  },
                  {
                    id: 'extreme',
                    title: 'Extreme',
                    desc: 'High compression',
                    badge: '75% off',
                  },
                  {
                    id: 'recommended',
                    title: 'Balanced',
                    desc: 'Standard quality',
                    badge: 'Popular',
                  },
                  {
                    id: 'light',
                    title: 'High Detail',
                    desc: 'Crisp graphics',
                    badge: 'Preserve',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setCompressionLevel(item.id as any)}
                    className={`cursor-pointer p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all ${
                      compressionLevel === item.id
                        ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={compressPdf}
                disabled={isProcessing}
                className="w-full mt-2 sm:mt-4 py-3 sm:py-3.5 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold text-sm shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compressing inside browser ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Compress PDF Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Ad banner placed AFTER the Result Card so it never hides or pushes the result off screen */}
          <AdBanner format="in-tool" slot="pdf-compress-inline" />

          {/* Floating Sticky Mobile Download Bar (Guarantees 1-Tap Access Anywhere on Screen) */}
          {compressedBlob && (
            <div className="sm:hidden fixed bottom-4 inset-x-4 z-40 animate-in slide-in-from-bottom-5 duration-300">
              <button
                type="button"
                onClick={downloadFile}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold text-sm shadow-[0_10px_25px_rgba(5,150,105,0.45)] flex items-center justify-between border border-emerald-400/40 active:scale-95 transition-transform"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 animate-bounce" />
                  <span>Download Ready (.pdf)</span>
                </span>
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                  -{savingsPercent}% Saved
                </span>
              </button>
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
