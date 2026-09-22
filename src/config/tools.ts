export interface ToolStep {
  title: string;
  description: string;
}

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolConfig {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: 'pdf' | 'image' | 'video-audio';
  categoryName: string;
  icon: string;
  badge?: string;
  accentColor: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  features: string[];
  steps: ToolStep[];
  faqs: ToolFaq[];
}

export const TOOLS: ToolConfig[] = [
  // --- PDF TOOLS ---
  {
    id: 'compress-pdf',
    slug: 'compress-pdf',
    name: 'Compress PDF',
    tagline: 'Reduce PDF file size without losing quality',
    description: 'Compress large PDF documents online in seconds. 100% private and processed entirely on your device with no upload limits.',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'FileArchive',
    badge: 'Popular',
    accentColor: '#ef4444',
    metaTitle: 'Compress PDF Online Free - Reduce PDF File Size (100% Private)',
    metaDescription: 'Reduce the file size of your PDF documents instantly in your browser without losing quality. Zero server uploads, completely private and free.',
    keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'pdf compressor online', 'free pdf compress without upload'],
    features: [
      'Shrink PDF size up to 80% while retaining readability',
      '100% client-side: Files never leave your browser',
      'No file size caps or registration required',
      'Instant download with before & after size comparison'
    ],
    steps: [
      { title: 'Upload your PDF', description: 'Drag and drop your PDF document into the box or click to select.' },
      { title: 'Choose Compression Level', description: 'Select between Extreme, Recommended, or High Quality compression.' },
      { title: 'Download Compressed File', description: 'Click Download to instantly save your smaller, optimized PDF.' }
    ],
    faqs: [
      { question: 'Is it safe to compress sensitive PDFs here?', answer: 'Yes, 100%. Unlike other online PDF tools, your file is processed directly inside your browser using WebAssembly. It is never uploaded to any remote server.' },
      { question: 'How much can this tool reduce my PDF size?', answer: 'Depending on the images and text contained in your PDF, you can typically reduce file size by 30% to 80% with virtually no visible difference in document quality.' },
      { question: 'Is there a limit on how many PDFs I can compress?', answer: 'No! There are no daily limits, wait times, or paywalls.' }
    ]
  },
  {
    id: 'merge-pdf',
    slug: 'merge-pdf',
    name: 'Merge PDF',
    tagline: 'Combine multiple PDF files into one clean document',
    description: 'Merge and reorder multiple PDF documents into a single organized file in seconds directly in your web browser.',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'FilePlus2',
    badge: 'Essential',
    accentColor: '#dc2626',
    metaTitle: 'Merge PDF Online - Combine Multiple PDFs Free & Securely',
    metaDescription: 'Combine multiple PDF files into one single PDF in seconds. Drag to reorder pages and files. 100% client-side privacy guarantee.',
    keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'merge pdf online free', 'pdf binder'],
    features: [
      'Combine unlimited PDF documents into a single file',
      'Drag-and-drop page and file reordering',
      'High-speed in-browser stitching with zero upload lag',
      'Preserves original bookmarks, hyperlinks, and layout'
    ],
    steps: [
      { title: 'Select PDF Files', description: 'Upload two or more PDF files you want to combine.' },
      { title: 'Arrange Order', description: 'Drag the file cards up or down to set the exact sequence you want.' },
      { title: 'Merge & Save', description: 'Hit "Merge PDFs" to instantly download your combined document.' }
    ],
    faqs: [
      { question: 'Can I reorder the PDF files before merging?', answer: 'Yes! You can reorder the documents simply by dragging the cards into your preferred sequence.' },
      { question: 'Do my files get stored on a server?', answer: 'Never. The merging takes place in your computer or mobile memory via WebAssembly.' }
    ]
  },
  {
    id: 'sign-pdf',
    slug: 'sign-pdf',
    name: 'Sign PDF',
    tagline: 'Draw, type, or upload your signature onto PDF documents',
    description: 'Add legal electronic signatures to any contract, agreement, or receipt directly in your browser without expensive subscriptions.',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'PenTool',
    badge: 'Trending',
    accentColor: '#b91c1c',
    metaTitle: 'Sign PDF Online Free - Add Signature to PDF Without Account',
    metaDescription: 'Electronically sign PDF documents in seconds. Draw your signature, type it, or upload an image and place it anywhere on the page.',
    keywords: ['sign pdf', 'e-sign pdf free', 'add signature to pdf', 'online pdf signer', 'sign document online'],
    features: [
      'Draw signature smoothly with mouse, stylus, or fingertip',
      'Type your name with elegant handwriting calligraphy fonts',
      'Upload signature PNG with transparent background',
      'Resize, reposition, and place signature anywhere on any page'
    ],
    steps: [
      { title: 'Open PDF', description: 'Load the PDF document you need to sign.' },
      { title: 'Create Signature', description: 'Draw, type, or upload your personal signature.' },
      { title: 'Place & Download', description: 'Click anywhere on the document to position your signature and export.' }
    ],
    faqs: [
      { question: 'Is this electronic signature legally binding?', answer: 'Yes, in most jurisdictions (including the US ESIGN Act and EU eIDAS regulation), digital signatures placed on documents are legally recognized for general business agreements.' },
      { question: 'Can I sign on mobile or iPad?', answer: 'Absolutely! Our smooth canvas supports touch, pencil, and stylus on all phones, tablets, and desktops.' }
    ]
  },
  {
    id: 'pdf-to-text',
    slug: 'pdf-to-text',
    name: 'PDF to Text',
    tagline: 'Extract all text, paragraphs, and data from PDF',
    description: 'Convert PDF documents into editable raw text and markdown. Easily copy extracted text or download as a text file.',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'FileText',
    accentColor: '#991b1b',
    metaTitle: 'PDF to Text Converter - Extract Text from PDF Online Free',
    metaDescription: 'Extract editable text from any PDF document in 1 second. Clean formatting, 1-click clipboard copy, and zero server upload.',
    keywords: ['pdf to text', 'extract text from pdf', 'convert pdf to txt', 'pdf text extractor online'],
    features: [
      'Instant text extraction across multi-page PDFs',
      '1-click copy to clipboard or download as .txt',
      'Preserves paragraph breaks and spacing',
      'Completely private & offline capable'
    ],
    steps: [
      { title: 'Select your PDF', description: 'Choose any PDF document from your device.' },
      { title: 'Extract Content', description: 'The text is extracted instantly inside your browser.' },
      { title: 'Copy or Download', description: 'Copy to clipboard or download the full text file.' }
    ],
    faqs: [
      { question: 'Does this work on scanned PDFs?', answer: 'This tool extracts native text embedded in PDFs. For scanned camera images, an OCR layer is required.' }
    ]
  },

  // --- IMAGE TOOLS ---
  {
    id: 'remove-background',
    slug: 'remove-background',
    name: 'Remove Background',
    tagline: 'Remove photo backgrounds with 1-click in browser',
    description: 'Isolate subjects and erase image backgrounds automatically. Download high-resolution transparent PNGs with no watermarks.',
    category: 'image',
    categoryName: 'Image Tools',
    icon: 'Eraser',
    badge: 'Smart Cut',
    accentColor: '#3b82f6',
    metaTitle: 'Free Background Remover - Remove Image Background Online',
    metaDescription: 'Remove background from photos 100% free with 1 click. Transparent PNG output, zero watermarks, and completely processed in your browser.',
    keywords: ['remove background', 'background remover free', 'transparent background maker', 'erase photo background', 'remove bg free'],
    features: [
      'Automatic subject detection & background eraser',
      'Full resolution output with zero watermarks',
      'Transparent PNG, white background, or custom color fills',
      'Works for portraits, ecommerce products, and logos'
    ],
    steps: [
      { title: 'Upload Photo', description: 'Upload any JPG, PNG, or WebP photo.' },
      { title: 'Auto-Erase', description: 'The background is cleanly removed in seconds.' },
      { title: 'Download PNG', description: 'Save your transparent PNG image in original full resolution.' }
    ],
    faqs: [
      { question: 'Are there any watermarks or payment required?', answer: 'No! Unlike tools that charge or add watermarks, QuickTools is 100% free and saves original quality.' }
    ]
  },
  {
    id: 'compress-image',
    slug: 'compress-image',
    name: 'Compress Image',
    tagline: 'Reduce PNG, JPG, and WebP size by up to 90%',
    description: 'Compress images for websites, emails, and social media without sacrificing visual sharpness. Real-time file size savings preview.',
    category: 'image',
    categoryName: 'Image Tools',
    icon: 'Minimize2',
    badge: 'Super Fast',
    accentColor: '#2563eb',
    metaTitle: 'Compress Image Online - Reduce JPG, PNG, WebP File Size Free',
    metaDescription: 'Compress images online without losing quality. Shrink JPG, PNG, and WebP photos by up to 90%. Real-time preview and instant download.',
    keywords: ['compress image', 'reduce image size', 'compress jpg', 'compress png', 'shrink photo size online'],
    features: [
      'Shrink image files up to 90% with minimal quality difference',
      'Interactive quality slider with live before/after size indicator',
      'Batch compress multiple photos simultaneously',
      'Instant side-by-side zoom visual comparison'
    ],
    steps: [
      { title: 'Choose Images', description: 'Drag and drop one or multiple images.' },
      { title: 'Adjust Quality', description: 'Move the quality slider to find your ideal balance of size and crispness.' },
      { title: 'Download', description: 'Download the compressed image or all as a batch.' }
    ],
    faqs: [
      { question: 'Which image formats are supported?', answer: 'JPG, JPEG, PNG, and modern WebP formats are all supported.' }
    ]
  },
  {
    id: 'convert-image',
    slug: 'convert-image',
    name: 'Convert Image',
    tagline: 'Convert between PNG, JPG, WebP, and AVIF',
    description: 'Convert any image format instantly in the browser. Perfect for modern web optimization (converting heavy PNGs to lightweight WebP).',
    category: 'image',
    categoryName: 'Image Tools',
    icon: 'RefreshCcw',
    accentColor: '#1d4ed8',
    metaTitle: 'Image Converter Online - Convert PNG to JPG, WebP, AVIF Free',
    metaDescription: 'Convert image files to PNG, JPG, WebP, or AVIF formats instantly in your browser. Batch conversion with high speed and zero upload delay.',
    keywords: ['convert image', 'png to jpg', 'jpg to png', 'image to webp', 'convert photo format online'],
    features: [
      'Fast client-side format transformation',
      'Supports PNG, JPG, WebP, and AVIF',
      'Batch conversion of multiple files',
      'Maintains original dimensions and transparency'
    ],
    steps: [
      { title: 'Upload Images', description: 'Select the images you wish to convert.' },
      { title: 'Pick Target Format', description: 'Choose WebP, PNG, JPG, or AVIF.' },
      { title: 'Convert & Save', description: 'Download your converted files in 1 click.' }
    ],
    faqs: [
      { question: 'Why should I convert to WebP?', answer: 'WebP images are typically 30% smaller than JPGs and 50% smaller than PNGs while looking identical, which dramatically speeds up your website load times.' }
    ]
  },
  {
    id: 'resize-image',
    slug: 'resize-image',
    name: 'Resize Image',
    tagline: 'Scale image dimensions by pixels, percentage, or social presets',
    description: 'Resize photos to exact pixel width/height or preset sizes for Instagram, YouTube thumbnails, Facebook, and passport photos.',
    category: 'image',
    categoryName: 'Image Tools',
    icon: 'Maximize2',
    accentColor: '#1e40af',
    metaTitle: 'Resize Image Online - Change Photo Dimensions in Pixels Free',
    metaDescription: 'Resize photos and images online to exact width and height. Social media dimension presets (Instagram, YouTube, Twitter) with aspect ratio lock.',
    keywords: ['resize image', 'change image dimensions', 'resize photo in pixels', 'social media image resizer'],
    features: [
      'Resize by exact pixels, percentage, or centimeters',
      'Aspect ratio lock prevents distortion',
      'Built-in presets: Instagram Post (1080x1080), Story (1080x1920), YouTube Thumbnail (1280x720)',
      'Crisp high-resolution bicubic scaling'
    ],
    steps: [
      { title: 'Upload Photo', description: 'Select the photo you want to resize.' },
      { title: 'Set Dimensions', description: 'Enter target width & height or pick a social media preset.' },
      { title: 'Download Resized', description: 'Export your perfectly sized image immediately.' }
    ],
    faqs: [
      { question: 'Will resizing stretch or distort my image?', answer: 'No, our "Lock Aspect Ratio" feature keeps your photo proportions completely intact.' }
    ]
  },

  // --- VIDEO & AUDIO TOOLS ---
  {
    id: 'mp4-to-mp3',
    slug: 'mp4-to-mp3',
    name: 'MP4 to MP3',
    tagline: 'Extract crisp audio tracks from any video file',
    description: 'Extract high-quality MP3 audio from MP4, WebM, or MOV video clips right in your browser. Fast, private, and unlimited.',
    category: 'video-audio',
    categoryName: 'Video & Audio Tools',
    icon: 'Music',
    badge: 'Popular',
    accentColor: '#10b981',
    metaTitle: 'MP4 to MP3 Converter - Extract Audio from Video Online Free',
    metaDescription: 'Convert MP4 videos to MP3 audio files instantly online. Extract songs, podcasts, and speeches from video files without uploading to a server.',
    keywords: ['mp4 to mp3', 'video to audio converter', 'extract mp3 from mp4', 'convert video to mp3 online'],
    features: [
      'Extract crystal clear audio tracks at 320kbps / 192kbps',
      'Supports MP4, WebM, MOV, and MKV video formats',
      'Fast client-side Web Audio extraction',
      'Save audio directly to your device with 1 click'
    ],
    steps: [
      { title: 'Select Video', description: 'Upload your MP4 or video file.' },
      { title: 'Extract Audio', description: 'Our browser engine separates the audio stream.' },
      { title: 'Download MP3', description: 'Save your pristine audio file to your music library.' }
    ],
    faqs: [
      { question: 'Can I convert long video files?', answer: 'Yes! Because processing happens in your browser, there is no server upload timeout.' }
    ]
  },
  {
    id: 'trim-audio',
    slug: 'trim-audio',
    name: 'Trim Audio & MP3',
    tagline: 'Cut, trim, and make ringtones from audio files with visual waveform',
    description: 'Visual audio cutter to trim songs, remove silence, or create custom phone ringtones with millisecond precision.',
    category: 'video-audio',
    categoryName: 'Video & Audio Tools',
    icon: 'Scissors',
    badge: 'Interactive',
    accentColor: '#059669',
    metaTitle: 'Audio Cutter Online - Trim MP3 & Make Ringtones Free',
    metaDescription: 'Cut and trim audio files with interactive visual waveforms. Make ringtones, cut out silence, and export clean MP3 clips in seconds.',
    keywords: ['trim audio', 'cut mp3', 'audio cutter online', 'make ringtone free', 'mp3 trimmer'],
    features: [
      'Interactive visual audio player and marker controls',
      'Start and end markers with live preview playback',
      'Fade-in and fade-out volume smoothing',
      '100% private in-browser audio editing'
    ],
    steps: [
      { title: 'Load Audio', description: 'Upload your MP3, WAV, or AAC audio file.' },
      { title: 'Set Start & End', description: 'Set start and end timestamps or play to isolate the section.' },
      { title: 'Cut & Download', description: 'Export your trimmed clip with 1 click.' }
    ],
    faqs: [
      { question: 'Can I listen to the selection before saving?', answer: 'Yes, hit the "Play Selection" button to loop and preview your exact cut.' }
    ]
  },
  {
    id: 'compress-video',
    slug: 'compress-video',
    name: 'Compress Video',
    tagline: 'Shrink video size to fit WhatsApp, Discord & Email limits',
    description: 'Compress video files directly in your browser. Target specific file sizes (under 16MB for WhatsApp, under 25MB for Discord/Email).',
    category: 'video-audio',
    categoryName: 'Video & Audio Tools',
    icon: 'Video',
    badge: 'High Demand',
    accentColor: '#047857',
    metaTitle: 'Compress Video Online - Reduce Video Size for WhatsApp & Discord',
    metaDescription: 'Compress MP4 and WebM videos online without quality destruction. Shrink video files to fit WhatsApp (16MB) and Discord (25MB) limits free.',
    keywords: ['compress video', 'reduce video size', 'compress mp4 for whatsapp', 'shrink video size online free'],
    features: [
      '1-click presets: Fit WhatsApp (16MB), Discord (25MB), or Email',
      'Maintains audio synchronization and high clarity',
      'No watermarks, no signups, no video length limits',
      '100% private: Videos never touch external servers'
    ],
    steps: [
      { title: 'Choose Video', description: 'Drop your video file into the converter.' },
      { title: 'Select Target Size', description: 'Choose between Low, Medium, or WhatsApp preset.' },
      { title: 'Compress & Save', description: 'Download your lightweight video ready to share anywhere.' }
    ],
    faqs: [
      { question: 'Will my video have a watermark?', answer: 'Never! All outputs are clean with zero watermarks.' }
    ]
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'All Tools', count: 11, icon: 'LayoutGrid' },
  { id: 'pdf', name: 'PDF Tools', count: 4, icon: 'FileText' },
  { id: 'image', name: 'Image Tools', count: 4, icon: 'Image' },
  { id: 'video-audio', name: 'Video & Audio', count: 3, icon: 'Volume2' }
];

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
