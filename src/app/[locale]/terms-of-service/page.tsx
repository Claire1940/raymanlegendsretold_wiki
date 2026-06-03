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
  const path = '/terms-of-service'
  const image = `${siteUrl}/images/hero.webp`

  return {
    title: 'Terms of Service - Rayman Legends Retold Wiki',
    description: 'Read the terms that govern use of Rayman Legends Retold Wiki, an unofficial fan-made release and guide resource.',
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
      title: 'Terms of Service - Rayman Legends Retold Wiki',
      description: 'Terms and conditions for using this unofficial Rayman Legends Retold fan site.',
      images: [{ url: image, width: 1920, height: 1080, alt: 'Rayman Legends Retold key art' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Terms of Service - Rayman Legends Retold Wiki',
      description: 'Terms and conditions for using this unofficial Rayman Legends Retold fan site.',
      images: [image],
    },
    alternates: buildLanguageAlternates(path, locale as Locale, siteUrl),
  }
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative border-b border-border px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">Terms of Service</h1>
          <p className="mb-2 text-lg text-slate-300">
            Terms governing access to Rayman Legends Retold Wiki and its fan-made reference content.
          </p>
          <p className="text-sm text-slate-400">Last Updated: June 3, 2026</p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-invert prose-slate max-w-none">
            <h2>1. Acceptance</h2>
            <p>
              By using Rayman Legends Retold Wiki, you agree to these Terms of Service and our related privacy and
              copyright pages. If you do not agree, do not use the site.
            </p>

            <h2>2. Service Description</h2>
            <p>
              Rayman Legends Retold Wiki is an unofficial fan-made website that publishes release tracking, platform
              coverage, trailer references, community links, and gameplay guide content related to Rayman Legends Retold.
            </p>

            <h2>3. No Affiliation</h2>
            <p>
              This site is independent and is not affiliated with, endorsed by, or sponsored by Ubisoft or the owners
              of the Rayman franchise.
            </p>

            <h2>4. Acceptable Use</h2>
            <ul>
              <li>Use the site only for lawful purposes.</li>
              <li>Do not interfere with the site&apos;s operation, availability, or security.</li>
              <li>Do not scrape, mirror, or republish substantial portions of the site for commercial use.</li>
              <li>Do not post or transmit malicious code, spam, or misleading claims of affiliation.</li>
            </ul>

            <h2>5. Accuracy and Availability</h2>
            <p>
              We aim to keep information current, but release dates, storefront listings, pricing, and platform details
              can change. Content is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind.
            </p>

            <h2>6. Third-Party Links</h2>
            <p>
              The site links to Ubisoft, Steam, Epic Games, PlayStation Store, Xbox, YouTube, Discord, Reddit, and X.
              We do not control those services and are not responsible for their content, policies, or availability.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              Original site text, page layouts, and compilations belong to Rayman Legends Retold Wiki unless otherwise
              noted. Game names, logos, trailers, and other franchise assets remain the property of their respective owners.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Rayman Legends Retold Wiki will not be liable for indirect,
              incidental, special, consequential, or punitive damages arising from your use of the site or reliance on its content.
            </p>

            <h2>9. Changes</h2>
            <p>
              We may revise these terms at any time. Continued use of the site after updates means you accept the revised terms.
            </p>

            <h2>10. Governing Law</h2>
            <p>
              These terms are governed by applicable laws of the United States, without regard to conflict-of-law rules.
            </p>

            <h2>11. Contact</h2>
            <p>
              Questions about these terms can be sent to{' '}
              <a
                href="mailto:legal@raymanlegendsretold.wiki"
                className="text-[hsl(var(--nav-theme-light))] hover:underline"
              >
                legal@raymanlegendsretold.wiki
              </a>
              .
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
