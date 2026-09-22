import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TOOLS, getToolBySlug } from '@/config/tools';
import { ToolRenderer } from '@/components/ToolRenderer';
import { AdBanner } from '@/components/AdBanner';
import { AffiliateOffers } from '@/components/AffiliateOffers';
import { JsonLd } from '@/components/JsonLd';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: `https://quicktools.app/tools/${tool.slug}`,
    },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      type: 'website',
      url: `https://quicktools.app/tools/${tool.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const relatedTools = TOOLS.filter(
    (t) => t.category === tool.category && t.id !== tool.id
  ).slice(0, 3);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Google SEO Rich Schema Injection */}
      <JsonLd tool={tool} type="tool" />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
        <Link href="/" className="hover:text-indigo-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/#${tool.category}-tools`}
          className="hover:text-indigo-600 transition-colors"
        >
          {tool.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-900 dark:text-white font-medium">
          {tool.name}
        </span>
      </nav>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>100% Free & Unlimited In-Browser Utility</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
          {tool.name}
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {tool.tagline}
        </p>
      </div>

      {/* Top Leaderboard Ad Slot */}
      <div className="flex justify-center mb-8">
        <AdBanner format="leaderboard" slot={`${tool.slug}-top-leaderboard`} />
      </div>

      {/* Main Grid: Tool Workspace + Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Tool Workspace (Left 8-9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9">
          <ToolRenderer slug={tool.slug} />

          {/* Privacy Guarantee Pill */}
          <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>End-to-End Privacy:</strong> This tool executes using WebAssembly directly in your browser. Files never touch a remote server.
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 font-semibold text-emerald-600 shrink-0">
              <Zap className="w-3.5 h-3.5" />
              Instant Speed
            </div>
          </div>
        </div>

        {/* Sticky Sidebar (Right 3-4 cols) */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          {/* Sidebar High-RPM Ad */}
          <AdBanner format="sidebar" slot={`${tool.slug}-sidebar`} />

          {/* Related Tools Box */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-3">
              More {tool.categoryName}
            </h3>
            <div className="space-y-2.5">
              {relatedTools.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/tools/${rel.slug}`}
                  className="block p-3 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 hover:border-indigo-500 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-white group-hover:text-indigo-600">
                      {rel.name}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                    {rel.tagline}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* High-Ticket Creator & Business Partner Offers */}
      <div className="max-w-4xl mx-auto">
        <AffiliateOffers category={tool.category} />
      </div>

      {/* SEO Long-Form Content Section */}
      <section className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-12 max-w-4xl mx-auto space-y-12">
        {/* How It Works (HowTo Schema match) */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 text-center">
            How to {tool.name} Online for Free
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tool.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-3 shadow-md shadow-indigo-500/20">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 text-center">
            Why Use QuickTools for {tool.name}?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tool.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Comparison Matrix (High Ranking Signal) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 text-center">
            QuickTools vs. Traditional Cloud Tools
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                  <th className="pb-3 font-semibold">Feature</th>
                  <th className="pb-3 font-semibold text-indigo-600 dark:text-indigo-400">QuickTools (In-Browser)</th>
                  <th className="pb-3 font-semibold">Other Online Converters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                <tr>
                  <td className="py-3 font-medium">Privacy & Security</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400 font-semibold">100% Private (Never leaves device)</td>
                  <td className="py-3 text-zinc-400">Uploaded to remote cloud server</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Daily Usage Limits</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400 font-semibold">Unlimited Free Operations</td>
                  <td className="py-3 text-zinc-400">2-3 files per day limit / Paywall</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Processing Speed</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400 font-semibold">Instant (Direct CPU/GPU)</td>
                  <td className="py-3 text-zinc-400">Slow upload & download queues</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Account / Signup</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400 font-semibold">No signup or email needed</td>
                  <td className="py-3 text-zinc-400">Forced email registration</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mid-content Ad */}
        <div className="flex justify-center">
          <AdBanner format="inline" slot={`${tool.slug}-mid-content`} />
        </div>

        {/* FAQ Accordion (FAQPage Schema match) */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {tool.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              >
                <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Ad */}
      <div className="mt-16 flex justify-center">
        <AdBanner format="leaderboard" slot={`${tool.slug}-bottom-leaderboard`} />
      </div>
    </div>
  );
}
