import Link from 'next/link'
import type { Metadata } from 'next'
import { buildLanguageAlternates } from '@/lib/i18n-utils'
import { type Locale } from '@/i18n/routing'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://raymanlegendsretold.wiki'
  const path = '/about'
  const image = `${siteUrl}/images/hero.webp`

  return {
    title: 'About Rayman Legends Retold Wiki',
    description: 'Learn about Rayman Legends Retold Wiki, an unofficial fan-made site focused on release details, editions, platforms, and co-op information.',
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale,
      url: locale === 'en' ? `${siteUrl}${path}` : `${siteUrl}/${locale}${path}`,
      siteName: 'Rayman Legends Retold Wiki',
      title: 'About Rayman Legends Retold Wiki',
      description: 'About this unofficial fan-made Rayman Legends Retold information hub.',
      images: [{ url: image, width: 1920, height: 1080, alt: 'Rayman Legends Retold key art' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About Rayman Legends Retold Wiki',
      description: 'About this unofficial fan-made Rayman Legends Retold information hub.',
      images: [image],
    },
    alternates: buildLanguageAlternates(path, locale as Locale, siteUrl),
  }
}

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative border-b border-border px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">About Rayman Legends Retold Wiki</h1>
          <p className="text-lg text-slate-300">
            An unofficial fan-made site built to track release details, editions, platforms, trailers, and co-op information.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-invert prose-slate max-w-none">
            <h2>What This Site Covers</h2>
            <p>
              Rayman Legends Retold Wiki is focused on the information players typically want before launch: release date,
              storefront links, editions, preorder bonuses, supported platforms, local co-op support, trailers, and
              official community channels.
            </p>

            <h2>Our Goal</h2>
            <p>
              The goal is to collect official Rayman Legends Retold references in one place and turn them into pages that
              are easy to browse, compare, and revisit as Ubisoft shares more details.
            </p>

            <h2>Editorial Approach</h2>
            <ul>
              <li>Prefer official Ubisoft, storefront, and platform sources wherever possible.</li>
              <li>Separate confirmed information from community speculation.</li>
              <li>Keep release tracking and platform coverage easy to scan.</li>
              <li>Link back to official channels for trailers, storefronts, and announcements.</li>
            </ul>

            <h2>Independence</h2>
            <p>
              Rayman Legends Retold Wiki is independent. It is not operated by Ubisoft and should be treated as a
              fan-made reference layer built around publicly available information.
            </p>

            <h2>Contact</h2>
            <p>
              General questions or corrections can be sent to{' '}
              <a
                href="mailto:contact@raymanlegendsretold.wiki"
                className="text-[hsl(var(--nav-theme-light))] hover:underline"
              >
                contact@raymanlegendsretold.wiki
              </a>
              . If you find an outdated release detail, storefront URL, or platform note, include the relevant page URL.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-8">
        <div className="container mx-auto max-w-4xl text-center">
          <Link href="/" className="text-[hsl(var(--nav-theme-light))] hover:underline">
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  )
}
