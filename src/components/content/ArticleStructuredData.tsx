import type { ContentFrontmatter, ContentType } from '@/lib/content'

interface ArticleStructuredDataProps {
	frontmatter: ContentFrontmatter
	contentType: ContentType
	locale: string
	slug: string
}

export function ArticleStructuredData({
	frontmatter,
	contentType,
	locale,
	slug,
}: ArticleStructuredDataProps) {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://raymanlegendsretold.wiki'
	const articleUrl =
		locale === 'en'
			? `${siteUrl}/${contentType}/${slug}`
			: `${siteUrl}/${locale}/${contentType}/${slug}`

	const breadcrumbData = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: siteUrl,
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: contentType.charAt(0).toUpperCase() + contentType.slice(1),
				item: `${siteUrl}/${contentType}`,
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: frontmatter.title,
				item: articleUrl,
			},
		],
	}

	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		'@id': `${articleUrl}#article`,
		url: articleUrl,
		headline: frontmatter.title,
		description: frontmatter.description,
		image: frontmatter.image || `${siteUrl}/images/hero.webp`,
		datePublished: frontmatter.date,
		dateModified: ('lastModified' in frontmatter && frontmatter.lastModified) || frontmatter.date,
		inLanguage: locale,
		author: {
			'@type': 'Organization',
			name: 'Rayman Legends Retold Wiki Team',
		},
		publisher: {
			'@type': 'Organization',
			name: 'Rayman Legends Retold Wiki',
			url: siteUrl,
			logo: {
				'@type': 'ImageObject',
				url: `${siteUrl}/android-chrome-512x512.png`,
			},
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': articleUrl,
		},
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
			/>
		</>
	)
}
