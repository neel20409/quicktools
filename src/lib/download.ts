/**
 * Safely downloads a Blob in the browser with guaranteed filename and extension.
 * Prevents Chromium/Edge from dropping the download attribute and saving files as raw GUIDs.
 */
export async function downloadBlob(blob: Blob, filename: string, mimeType?: string) {
  if (typeof window === 'undefined') return;

  const safeFilename = filename.replace(/[\\/:*?"<>|]/g, '_').trim() || 'document.pdf';

  // 1. Try modern File System Access API if available on desktop (Chrome, Edge on Windows/Mac)
  if ('showSaveFilePicker' in window) {
    try {
      const ext = safeFilename.includes('.') ? `.${safeFilename.split('.').pop()}` : '.pdf';
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: safeFilename,
        types: [
          {
            description: 'Document',
            accept: { [mimeType || 'application/pdf']: [ext] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') return; // User canceled dialog
      // Otherwise fall back to anchor click below
    }
  }

  // 2. Create typed File with explicit filename
  const fileObj = new File([blob], safeFilename, {
    type: mimeType || 'application/pdf',
    lastModified: Date.now(),
  });
  const url = URL.createObjectURL(fileObj);

  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  a.setAttribute('download', safeFilename);
  
  // Important: DO NOT use display: none, Chromium can ignore download attribute on non-rendered elements
  a.style.position = 'fixed';
  a.style.left = '-9999px';
  a.style.top = '-9999px';
  a.style.opacity = '0';

  document.body.appendChild(a);
  a.click();

  // Retain URL for 60 seconds to ensure streaming completes
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
