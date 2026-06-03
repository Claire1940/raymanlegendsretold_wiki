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
  const path = '/privacy-policy'
  const image = `${siteUrl}/images/hero.webp`

  return {
    title: 'Privacy Policy - Rayman Legends Retold Wiki',
    description: 'Read how Rayman Legends Retold Wiki handles analytics, cookies, and contact submissions on this unofficial fan-made resource site.',
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
      title: 'Privacy Policy - Rayman Legends Retold Wiki',
      description: 'How this Rayman Legends Retold fan site handles analytics, cookies, and visitor data.',
      images: [{ url: image, width: 1920, height: 1080, alt: 'Rayman Legends Retold key art' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Privacy Policy - Rayman Legends Retold Wiki',
      description: 'How this Rayman Legends Retold fan site handles analytics, cookies, and visitor data.',
      images: [image],
    },
    alternates: buildLanguageAlternates(path, locale as Locale, siteUrl),
  }
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative border-b border-border px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">Privacy Policy</h1>
          <p className="mb-2 text-lg text-slate-300">
            How Rayman Legends Retold Wiki collects, uses, and protects limited visitor data.
          </p>
          <p className="text-sm text-slate-400">Last Updated: June 3, 2026</p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-invert prose-slate max-w-none">
            <h2>1. Scope</h2>
            <p>
              Rayman Legends Retold Wiki is an unofficial fan-made reference site. This policy explains what limited
              information we collect when you browse the site, contact us, or interact with embedded third-party
              services such as YouTube.
            </p>

            <h2>2. Information We Collect</h2>
            <ul>
              <li>Basic analytics information such as page views, browser type, device category, and referring pages.</li>
              <li>Technical logs needed to monitor uptime, abuse, and site performance.</li>
              <li>Any information you voluntarily send to us by email.</li>
            </ul>

            <h2>3. Cookies and Local Storage</h2>
            <p>
              We may use cookies or similar browser storage to remember language and interface preferences, measure
              traffic trends, and improve the site. You can disable cookies in your browser, but some convenience
              features may work less reliably.
            </p>

            <h2>4. Third-Party Services</h2>
            <p>
              This site links to Ubisoft, Steam, Epic Games, PlayStation Store, Xbox, YouTube, Discord, Reddit, and
              X. Those services run under their own privacy policies. When you open those services or play an embedded
              video, their policies and tracking practices apply.
            </p>

            <h2>5. How We Use Data</h2>
            <ul>
              <li>Maintain and improve the website.</li>
              <li>Understand which guides and release-tracking pages are most useful.</li>
              <li>Respond to support, correction, or copyright inquiries.</li>
              <li>Protect the site against spam, abuse, and technical failures.</li>
            </ul>

            <h2>6. Data Sharing</h2>
            <p>
              We do not sell personal information. We may share limited data with service providers that help host,
              secure, or measure the site, or when disclosure is required by law.
            </p>

            <h2>7. Data Retention</h2>
            <p>
              Analytics and technical logs are retained only as long as reasonably necessary for reporting, security,
              and maintenance. Email inquiries may be kept for follow-up and recordkeeping.
            </p>

            <h2>8. Children&apos;s Privacy</h2>
            <p>
              This site is intended for a general audience and does not knowingly collect personal information from
              children under 13.
            </p>

            <h2>9. Your Choices</h2>
            <p>
              You may limit cookies through your browser, decline to contact us by email, or ask us to review or
              delete information you directly submitted where legally applicable.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this policy as the site evolves. Material changes will be reflected by updating the date
              shown at the top of this page.
            </p>

            <h2>11. Contact</h2>
            <p>
              Privacy questions can be sent to{' '}
              <a
                href="mailto:privacy@raymanlegendsretold.wiki"
                className="text-[hsl(var(--nav-theme-light))] hover:underline"
              >
                privacy@raymanlegendsretold.wiki
              </a>
              .
            </p>

            <h2>12. Disclaimer</h2>
            <p>
              Rayman Legends Retold Wiki is not affiliated with or endorsed by Ubisoft. Rayman and related marks are
              the property of their respective owners.
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
