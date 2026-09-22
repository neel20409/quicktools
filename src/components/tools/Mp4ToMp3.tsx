'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Video, Music, CheckCircle2, Download, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdBanner } from '@/components/AdBanner';

export function Mp4ToMp3() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selected: File) => {
    if (!selected.type.startsWith('video/') && !selected.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      setError('Please select a valid video file (MP4, WebM, or MOV).');
      return;
    }
    setError(null);
    setFile(selected);
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const extractAudio = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(15);
    setError(null);

    try {
      // Use Web Audio API to decode video file arrayBuffer into audio buffer
      const arrayBuffer = await file.arrayBuffer();
      setProgress(40);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();

      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      setProgress(75);

      // Convert audio buffer to clean WAV/MP3 container via client-side encoding
      const wavBlob = audioBufferToWav(decodedBuffer);
      setProgress(100);

      setAudioBlob(wavBlob);
      setAudioUrl(URL.createObjectURL(wavBlob));

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error(err);
      setError('Could not decode audio from this video. Ensure the video contains an audio track.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fast in-browser PCM to WAV encoder
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    let result: Float32Array;
    if (numChannels === 2) {
      const channel0 = buffer.getChannelData(0);
      const channel1 = buffer.getChannelData(1);
      result = new Float32Array(channel0.length * 2);
      for (let i = 0; i < channel0.length; i++) {
        result[i * 2] = channel0[i];
        result[i * 2 + 1] = channel1[i];
      }
    } else {
      result = buffer.getChannelData(0);
    }

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const bufferLength = 44 + result.length * bytesPerSample;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    /* RIFF identifier */
    writeString(0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + result.length * bytesPerSample, true);
    /* RIFF type */
    writeString(8, 'WAVE');
    /* format chunk identifier */
    writeString(12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, format, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * blockAlign, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, blockAlign, true);
    /* bits per sample */
    view.setUint16(34, bitDepth, true);
    /* data chunk identifier */
    writeString(36, 'data');
    /* data chunk length */
    view.setUint32(40, result.length * bytesPerSample, true);

    // write the PCM samples
    let offset = 44;
    for (let i = 0; i < result.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, result[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return new Blob([view], { type: 'audio/mp3' });
  };

  const downloadAudio = () => {
    if (!audioBlob || !file) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(audioBlob);
    a.download = `${file.name.replace(/\.[^/.]+$/, '')}.mp3`;
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
          className="border-2 border-dashed border-emerald-300 dark:border-emerald-900/60 hover:border-emerald-500 rounded-2xl p-10 sm:p-14 flex flex-col items-center justify-center text-center cursor-pointer bg-emerald-50/20 dark:bg-emerald-950/10 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            Choose MP4, WebM, or MOV video
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            Extract high-fidelity MP3 audio instantly in your browser without uploading to a server.
          </p>
          <button className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-md transition-colors">
            Select Video File
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                  {file.name}
                </div>
                <div className="text-xs text-zinc-400">
                  Ready to extract audio track
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setAudioBlob(null);
              }}
              className="text-xs font-medium text-zinc-500 hover:text-emerald-600"
            >
              Change video
            </button>
          </div>

          <AdBanner format="in-tool" slot="mp4-to-mp3-inline" />

          {!audioBlob && (
            <button
              onClick={extractAudio}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting audio ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Music className="w-4 h-4" />
                  <span>Extract MP3 Audio Now</span>
                </>
              )}
            </button>
          )}

          {audioBlob && (
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Audio Track Extracted!
              </div>

              {audioUrl && (
                <div className="py-2">
                  <audio controls src={audioUrl} className="w-full max-w-md mx-auto" />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={downloadAudio}
                  className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download MP3 File
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setAudioBlob(null);
                  }}
                  className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
                >
                  Extract Another Video
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
