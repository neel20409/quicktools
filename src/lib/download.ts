/**
 * Safely downloads a Blob in the browser with guaranteed filename and extension.
 * Crucially, prevents Chromium/Edge from revoking the object URL prematurely,
 * which causes downloads of large files (e.g. 67MB+) to lose their filename/extension
 * and be saved as raw blob UUIDs (e.g. 97b30aff-48d9-4ea4-9e07-7c).
 */
export function downloadBlob(blob: Blob, filename: string, mimeType?: string) {
  if (typeof window === 'undefined') return;

  const typedBlob = mimeType ? new Blob([blob], { type: mimeType }) : blob;
  const url = URL.createObjectURL(typedBlob);
  const a = document.createElement('a');

  a.href = url;
  a.download = filename;
  a.setAttribute('download', filename);
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();

  // Retain the URL for 60 seconds to allow the browser's download manager to finish streaming
  setTimeout(() => {
    try {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, 60000);
}
