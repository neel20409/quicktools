'use client';

import React from 'react';
import { Sparkles, ExternalLink, Shield, Star, Gift } from 'lucide-react';

interface AffiliateOffersProps {
  category: 'pdf' | 'image' | 'video-audio';
}

interface Offer {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  perk: string;
  url: string;
  ctaText: string;
  accentColor: string;
}

const OFFERS: Record<string, Offer[]> = {
  pdf: [
    {
      id: 'adobe-acrobat',
      name: 'Adobe Acrobat Pro',
      tagline: 'The industry-standard all-in-one PDF & e-sign software suite.',
      badge: 'Official Partner',
      perk: '7-Day Free Trial • Edit Text, OCR & Forms',
      url: 'https://www.adobe.com/acrobat.html',
      ctaText: 'Claim Free Trial',
      accentColor: '#dc2626',
    },
    {
      id: 'pcloud-storage',
      name: 'pCloud Secure Storage',
      tagline: 'Store and backup all your PDF documents with Swiss privacy encryption.',
      badge: 'Lifetime Deal',
      perk: 'Get 2TB Lifetime Backup • Pay Once, Use Forever',
      url: 'https://www.pcloud.com',
      ctaText: 'View 2TB Deal',
      accentColor: '#0284c7',
    },
  ],
  image: [
    {
      id: 'canva-pro',
      name: 'Canva Pro',
      tagline: 'Design stunning social media graphics, posters, and marketing assets.',
      badge: 'Editor Choice',
      perk: '30-Day Free Pro Trial • 100M+ Stock Photos & Templates',
      url: 'https://www.canva.com',
      ctaText: 'Try Canva Pro Free',
      accentColor: '#7c3aed',
    },
    {
      id: 'envato-elements',
      name: 'Envato Elements',
      tagline: 'Unlimited downloads of premium stock photos, mockups, and fonts.',
      badge: 'Creative Bundle',
      perk: 'Unlimited Graphic & Video Assets with Commercial License',
      url: 'https://elements.envato.com',
      ctaText: 'Explore Elements',
      accentColor: '#16a34a',
    },
  ],
  'video-audio': [
    {
      id: 'descript-ai',
      name: 'Descript Video & Audio Editor',
      tagline: 'Edit video and audio like a text doc using cutting-edge AI.',
      badge: 'Viral AI Tool',
      perk: 'Automatic Filler-Word Removal & Studio Sound Voice Boost',
      url: 'https://www.descript.com',
      ctaText: 'Try Free with AI',
      accentColor: '#2563eb',
    },
    {
      id: 'epidemic-sound',
      name: 'Epidemic Sound',
      tagline: 'Royalty-free music and sound effects for YouTube, TikTok & Reels.',
      badge: 'Creator Essential',
      perk: '30-Day Free Unlimited Soundtrack Access',
      url: 'https://www.epidemicsound.com',
      ctaText: 'Start Free Month',
      accentColor: '#f59e0b',
    },
  ],
};

export function AffiliateOffers({ category }: AffiliateOffersProps) {
  const categoryOffers = OFFERS[category] || OFFERS.pdf;

  return (
    <div className="my-10 p-6 rounded-3xl bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-900/90 dark:via-zinc-900 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" />
            <span>Recommended Creator & Business Deals</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
            Exclusive Professional Partner Offers
          </h3>
        </div>
        <span className="text-[11px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full w-fit">
          Curated & Verified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categoryOffers.map((offer) => (
          <a
            key={offer.id}
            href={offer.url}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="group relative p-5 rounded-2xl bg-white dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60 hover:border-indigo-500/80 dark:hover:border-indigo-500/80 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${offer.accentColor}18`,
                    color: offer.accentColor,
                  }}
                >
                  {offer.badge}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
              </div>

              <h4 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {offer.name}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {offer.tagline}
              </p>

              <div className="mt-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Star className="w-3 h-3 fill-emerald-500 text-emerald-500 shrink-0" />
                <span>{offer.perk}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>{offer.ctaText}</span>
              <span className="text-zinc-400 font-normal text-[10px]">Official Partner</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
