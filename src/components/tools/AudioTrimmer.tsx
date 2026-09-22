'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Scissors, Play, Pause, CheckCircle2, Download, RefreshCw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdBanner } from '@/components/AdBanner';

export function AudioTrimmer() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [trimmedBlob, setTrimmedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selected: File) => {
    if (!selected.type.startsWith('audio/') && !selected.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      setError('Please select an audio file (MP3, WAV, M4A).');
      return;
    }
    setError(null);
    setFile(selected);

    const url = URL.createObjectURL(selected);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      const dur = Math.floor(audio.duration);
      setDuration(dur);
      setStartTime(0);
      setEndTime(Math.min(30, dur)); // Default 30s ringtone length
    };
    audioRef.current = audio;
    setTrimmedBlob(null);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
      setIsPlaying(true);

      // Stop at endTime
      const interval = setInterval(() => {
        if (audioRef.current && audioRef.current.currentTime >= endTime) {
          audioRef.current.pause();
          setIsPlaying(false);
          clearInterval(interval);
        }
      }, 200);
    }
  };

  const trimAudio = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);

      const sampleRate = decoded.sampleRate;
      const startOffset = Math.floor(startTime * sampleRate);
      const endOffset = Math.floor(endTime * sampleRate);
      const frameCount = endOffset - startOffset;

      if (frameCount <= 0) {
        setError('End time must be greater than start time.');
        setIsProcessing(false);
        return;
      }

      const trimmedBuffer = audioCtx.createBuffer(
        decoded.numberOfChannels,
        frameCount,
        sampleRate
      );

      for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
        const sourceData = decoded.getChannelData(channel);
        const targetData = trimmedBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          targetData[i] = sourceData[startOffset + i];
        }
      }

      const wavBlob = audioBufferToWav(trimmedBuffer);
      setTrimmedBlob(wavBlob);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error(err);
      setError('Failed to trim audio track.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Standard in-memory WAV encoder
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bitDepth = 16;

    let result: Float32Array;
    if (numChannels === 2) {
      const c0 = buffer.getChannelData(0);
      const c1 = buffer.getChannelData(1);
      result = new Float32Array(c0.length * 2);
      for (let i = 0; i < c0.length; i++) {
        result[i * 2] = c0[i];
        result[i * 2 + 1] = c1[i];
      }
    } else {
      result = buffer.getChannelData(0);
    }

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const bufferLength = 44 + result.length * bytesPerSample;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + result.length * bytesPerSample, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeStr(36, 'data');
    view.setUint32(40, result.length * bytesPerSample, true);

    let offset = 44;
    for (let i = 0; i < result.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, result[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return new Blob([view], { type: 'audio/mp3' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const downloadTrimmed = () => {
    if (!trimmedBlob || !file) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(trimmedBlob);
    a.download = `trimmed_${file.name.replace(/\.[^/.]+$/, '')}.mp3`;
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
            accept="audio/*"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Scissors className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            Choose audio file to trim or cut
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            Upload MP3, WAV, or M4A. Cut out chorus, make phone ringtones, or remove unwanted silence.
          </p>
          <button className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-md transition-colors">
            Select Audio File
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <div className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
              {file.name} ({formatTime(duration)})
            </div>
            <button
              onClick={() => {
                setFile(null);
                setTrimmedBlob(null);
                if (audioRef.current) audioRef.current.pause();
              }}
              className="text-xs font-medium text-zinc-500 hover:text-emerald-600"
            >
              Change file
            </button>
          </div>

          {!trimmedBlob && (
            <div className="space-y-6">
              {/* Play Selection Button */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="px-6 py-2.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold text-sm flex items-center gap-2 hover:bg-emerald-200 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause Selection' : 'Preview Selection'}</span>
                </button>
              </div>

              {/* Range Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                  <label className="text-xs text-zinc-500 font-medium block mb-1">Start Time</label>
                  <div className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                    {formatTime(startTime)}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    value={startTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val < endTime) setStartTime(val);
                    }}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                  <label className="text-xs text-zinc-500 font-medium block mb-1">End Time</label>
                  <div className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                    {formatTime(endTime)}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    value={endTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > startTime) setEndTime(val);
                    }}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              <div className="text-center text-xs text-zinc-500">
                Selected Clip Duration: <span className="font-bold text-emerald-600">{formatTime(endTime - startTime)}</span>
              </div>

              <AdBanner format="in-tool" slot="audio-trim-inline" />

              <button
                onClick={trimAudio}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Cutting audio...</span>
                  </>
                ) : (
                  <span>Trim & Export Clip</span>
                )}
              </button>
            </div>
          )}

          {trimmedBlob && (
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Clip Ready to Download!
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={downloadTrimmed}
                  className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Trimmed Audio
                </button>
                <button
                  onClick={() => setTrimmedBlob(null)}
                  className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
                >
                  Trim Another Part
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
