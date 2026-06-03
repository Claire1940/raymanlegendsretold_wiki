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
  const path = '/copyright'
  const image = `${siteUrl}/images/hero.webp`

  return {
    title: 'Copyright Notice - Rayman Legends Retold Wiki',
    description: 'Copyright, fair use, and takedown information for Rayman Legends Retold Wiki.',
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
      title: 'Copyright Notice - Rayman Legends Retold Wiki',
      description: 'Copyright, trademark, and takedown information for this unofficial Rayman fan site.',
      images: [{ url: image, width: 1920, height: 1080, alt: 'Rayman Legends Retold key art' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Copyright Notice - Rayman Legends Retold Wiki',
      description: 'Copyright, trademark, and takedown information for this unofficial Rayman fan site.',
      images: [image],
    },
    alternates: buildLanguageAlternates(path, locale as Locale, siteUrl),
  }
}

export default function Copyright() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative border-b border-border px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">Copyright Notice</h1>
          <p className="mb-2 text-lg text-slate-300">
            Copyright, trademarks, fair use, and takedown procedures for this fan-made Rayman resource site.
          </p>
          <p className="text-sm text-slate-400">Last Updated: June 3, 2026</p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-invert prose-slate max-w-none">
            <h2>1. Site Content</h2>
            <p>
              Original articles, summaries, layouts, and data compilations on Rayman Legends Retold Wiki are owned by
              the site unless another source is credited.
            </p>

            <h2>2. Game Assets and Trademarks</h2>
            <p>
              Rayman, Rayman Legends Retold, Ubisoft, logos, trailers, screenshots, and related franchise materials are
              the property of their respective owners. Their appearance on this site is for identification, commentary,
              and reference purposes only.
            </p>

            <h2>3. Fair Use Position</h2>
            <ul>
              <li>We use limited excerpts of official materials to describe the game and its availability.</li>
              <li>Our pages are informational and transformative rather than a substitute for official products.</li>
              <li>We do not claim ownership of Ubisoft or Rayman intellectual property.</li>
            </ul>

            <h2>4. Reuse of Our Original Content</h2>
            <p>
              You may quote brief excerpts from our original writing with attribution and a link back to the relevant page.
              Republishing full guides or large copied sections requires written permission.
            </p>

            <h2>5. Takedown Requests</h2>
            <p>
              If you believe content on this site infringes your rights, email us with a description of the work at issue,
              the page URL, your contact information, and the basis for your claim.
            </p>

            <h2>6. Counter-Notice</h2>
            <p>
              If material you submitted was removed in error, you may reply with an explanation and supporting details
              so we can review the request fairly.
            </p>

            <h2>7. Contact</h2>
            <p>
              Copyright and takedown inquiries can be sent to{' '}
              <a
                href="mailto:copyright@raymanlegendsretold.wiki"
                className="text-[hsl(var(--nav-theme-light))] hover:underline"
              >
                copyright@raymanlegendsretold.wiki
              </a>
              . DMCA-style notices may also be sent to{' '}
              <a
                href="mailto:dmca@raymanlegendsretold.wiki"
                className="text-[hsl(var(--nav-theme-light))] hover:underline"
              >
                dmca@raymanlegendsretold.wiki
              </a>
              .
            </p>

            <h2>8. Disclaimer</h2>
            <p>
              Rayman Legends Retold Wiki is an unofficial fan-made website and is not affiliated with Ubisoft.
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
