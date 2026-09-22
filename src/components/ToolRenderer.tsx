'use client';

import React from 'react';
import { PdfCompressor } from './tools/PdfCompressor';
import { PdfMerger } from './tools/PdfMerger';
import { PdfSigner } from './tools/PdfSigner';
import { PdfToText } from './tools/PdfToText';
import { BackgroundRemover } from './tools/BackgroundRemover';
import { ImageCompressor } from './tools/ImageCompressor';
import { ImageConverter } from './tools/ImageConverter';
import { ImageResizer } from './tools/ImageResizer';
import { Mp4ToMp3 } from './tools/Mp4ToMp3';
import { AudioTrimmer } from './tools/AudioTrimmer';
import { VideoCompressor } from './tools/VideoCompressor';

interface ToolRendererProps {
  slug: string;
}

export function ToolRenderer({ slug }: ToolRendererProps) {
  switch (slug) {
    case 'compress-pdf':
      return <PdfCompressor />;
    case 'merge-pdf':
      return <PdfMerger />;
    case 'sign-pdf':
      return <PdfSigner />;
    case 'pdf-to-text':
      return <PdfToText />;
    case 'remove-background':
      return <BackgroundRemover />;
    case 'compress-image':
      return <ImageCompressor />;
    case 'convert-image':
      return <ImageConverter />;
    case 'resize-image':
      return <ImageResizer />;
    case 'mp4-to-mp3':
      return <Mp4ToMp3 />;
    case 'trim-audio':
      return <AudioTrimmer />;
    case 'compress-video':
      return <VideoCompressor />;
    default:
      return <div>Tool not found</div>;
  }
}
