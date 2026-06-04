import {
  BookOpen,
  Calendar,
  Columns3,
  Compass,
  Layers3,
  Monitor,
  ShoppingCart,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

export const navigation: NavigationItem[] = [
  { key: 'release', path: '/release', icon: Calendar, isContentType: true },
  { key: 'platforms', path: '/platforms', icon: Monitor, isContentType: true },
  { key: 'preorder', path: '/preorder', icon: ShoppingCart, isContentType: true },
  { key: 'editions', path: '/editions', icon: Layers3, isContentType: true },
  { key: 'comparison', path: '/comparison', icon: Columns3, isContentType: true },
  { key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
  { key: 'walkthrough', path: '/walkthrough', icon: Compass, isContentType: true },
]
export const NAVIGATION_CONFIG: NavigationItem[] = navigation

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/' -> ['codes', 'build', 'combat', 'guides']

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
