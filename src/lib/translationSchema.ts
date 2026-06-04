/**
 * Translation Schema Validation
 *
 * 使用 Zod 在运行时验证翻译数据的完整性
 * 在开发环境中，如果数据不符合预期，会提供详细的错误信息
 */

import { z } from 'zod'

const JsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
)

export const TranslationsSchema = z.object({
  seo: z.object({
    home: z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.string(),
      ogTitle: z.string(),
      ogDescription: z.string(),
      twitterTitle: z.string(),
      twitterDescription: z.string(),
    }),
  }),
  nav: z.record(z.string(), z.string()),
  common: z.object({
    home: z.string(),
    more: z.string(),
    playNow: z.string(),
    switchLanguage: z.string(),
    switchTheme: z.string(),
    lightMode: z.string(),
    darkMode: z.string(),
    notFound: z.string(),
    notFoundDescription: z.string(),
    backToHome: z.string(),
    relatedArticles: z.string(),
    readMore: z.string(),
    articlesComingSoon: z.string(),
  }),
  hero: z.object({
    badge: z.string(),
    title: z.string(),
    description: z.string(),
    getFreeCodesCTA: z.string(),
    playOnSteamCTA: z.string(),
    stats: z.record(
      z.string(),
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    ),
  }),
  gameFeature: z.object({
    title: z.string(),
    description: z.string(),
  }),
  tools: JsonValueSchema,
  modules: JsonValueSchema,
  pages: JsonValueSchema,
  faq: JsonValueSchema,
  cta: JsonValueSchema,
  footer: JsonValueSchema,
})

// ============================================
// 验证函数
// ============================================

/**
 * 验证翻译数据
 * 在开发环境中会打印详细的错误信息
 */
export function validateTranslations(data: unknown, locale: string) {
  const result = TranslationsSchema.safeParse(data)

  if (!result.success) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Translation validation failed for locale: ${locale}`)
      console.error('Errors:', result.error.format())

      // 打印每个错误的详细路径
      result.error.issues.forEach(issue => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
      })
    }

    return {
      success: false,
      error: result.error
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Translation validation passed for locale: ${locale}`)
  }

  return {
    success: true,
    data: result.data
  }
}

/**
 * 验证特定模块的数据
 */
export function validateModule<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  moduleName: string
): { success: boolean; data?: T; error?: z.ZodError } {
  const result = schema.safeParse(data)

  if (!result.success) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Module validation failed: ${moduleName}`)
      console.error('Errors:', result.error.format())
    }

    return {
      success: false,
      error: result.error
    }
  }

  return {
    success: true,
    data: result.data
  }
}

// ============================================
// 类型推导（从 Schema 自动生成 TypeScript 类型）
// ============================================

export type Translations = z.infer<typeof TranslationsSchema>
export type IconCard = {
  icon: string
  title: string
  description: string
}
