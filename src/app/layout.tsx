import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdBlockNotice } from '@/components/AdBlockNotice';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://quicktools-fawn.vercel.app'),
  title: {
    default: 'QuickTools - Free Private Online PDF, Image & Video Tools',
    template: '%s | QuickTools',
  },
  description:
    'Free, high-speed, and 100% private online tools to compress PDF, merge PDF, remove photo backgrounds, compress images, and convert video to MP3 directly in your browser.',
  keywords: [
    'online tools',
    'compress pdf',
    'merge pdf',
    'remove background',
    'image compressor',
    'mp4 to mp3',
    'free pdf tools',
    'client side pdf tools',
  ],
  authors: [{ name: 'QuickTools Team' }],
  creator: 'QuickTools',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://quicktools.app',
    title: 'QuickTools - Free Private Online PDF, Image & Video Tools',
    description:
      'All-in-one suite of private in-browser utilities. 100% client-side: your files never leave your device.',
    siteName: 'QuickTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuickTools - Free Private Online PDF, Image & Video Tools',
    description:
      'Zero server upload file tools. Fast, free, unlimited PDF, Image, and Audio/Video processing in your browser.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '80OuNJFLs9jPTIyWwPWmkau1BpEeDC-_P3g0o3ZQ1GU',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-8023550227126773';

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-site-verification" content="80OuNJFLs9jPTIyWwPWmkau1BpEeDC-_P3g0o3ZQ1GU" />
        <meta name="google-adsense-account" content={adsenseId} />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <AdBlockNotice />
        <Footer />
      </body>
    </html>
  );
}
