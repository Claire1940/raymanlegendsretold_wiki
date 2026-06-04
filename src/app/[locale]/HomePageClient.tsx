"use client";

import { useState, Suspense, lazy } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronDown,
  ExternalLink,
  Gamepad2,
  Map,
  Monitor,
  Package,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { SidebarAd } from "@/components/ads/SidebarAd";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

function LinkedTitle({
  linkData,
  children,
  className,
  locale,
}: {
  linkData: { url: string; title: string } | null | undefined;
  children: ReactNode;
  className?: string;
  locale: string;
}) {
  if (linkData) {
    const href = locale === "en" ? linkData.url : `/${locale}${linkData.url}`;
    return (
      <Link
        href={href}
        className={`${className || ""} hover:text-[hsl(var(--nav-theme-light))] hover:underline decoration-[hsl(var(--nav-theme-light))/0.4] underline-offset-4 transition-colors`}
        title={linkData.title}
      >
        {children}
      </Link>
    );
  }

  return <>{children}</>;
}

type ModulePrimitive = string | number | string[];

interface ModuleItem {
  [key: string]: ModulePrimitive | undefined;
}

interface HomeModule {
  id: string;
  order: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  intro: string;
  layout: {
    type: "table" | "card-list" | "step-by-step" | "accordion";
    desktop: string;
    mobile: string;
  };
  items: ModuleItem[];
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

const PRIMARY_FIELD_KEYS = ["title", "name", "edition", "platform", "label"] as const;
const MODULE_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  "release-date-and-platforms": Calendar,
  "pre-order-editions-and-bonuses": Package,
  "gameplay-and-new-features": Sparkles,
  "beginner-guide": BookOpen,
  "walkthrough-and-levels": Map,
  "characters-and-story": Users,
  "co-op-and-kung-foot": Gamepad2,
  "pc-requirements-and-languages": Monitor,
};

function formatKeyLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPrimaryFieldKey(item: ModuleItem): string | null {
  for (const key of PRIMARY_FIELD_KEYS) {
    if (typeof item[key] === "string" && item[key]) return key;
  }
  return null;
}

function getPrimaryFieldValue(item: ModuleItem): string {
  const key = getPrimaryFieldKey(item);
  return key && typeof item[key] === "string" ? item[key] : "Untitled";
}

function getBadgeValue(item: ModuleItem): string | null {
  const badgeKeys = ["type", "role", "format", "store"];
  for (const key of badgeKeys) {
    if (typeof item[key] === "string" && item[key]) return item[key];
  }
  return null;
}

function getBodyText(item: ModuleItem): string | null {
  const bodyKeys = ["description", "details", "action", "summary", "story_function", "value"];
  for (const key of bodyKeys) {
    if (typeof item[key] === "string" && item[key]) return item[key];
  }
  return null;
}

function getSupportText(item: ModuleItem): string | null {
  const supportKeys = ["tip", "player_value", "player_goal", "what_players_see", "best_for"];
  for (const key of supportKeys) {
    if (typeof item[key] === "string" && item[key]) return item[key];
  }
  return null;
}

function renderFieldValue(value: ModulePrimitive) {
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-2 text-sm text-muted-foreground">
        {value.map((entry, index) => (
          <li key={`${entry}-${index}`} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[hsl(var(--nav-theme-light))]" />
            <span>{entry}</span>
          </li>
        ))}
      </ul>
    );
  }

  return <p className="text-sm text-muted-foreground">{value}</p>;
}

function renderModuleItems(
  module: HomeModule,
  moduleLinkMap: ModuleLinkMap,
  locale: string,
  expandedItems: Record<string, number | null>,
  toggleAccordionItem: (moduleId: string, index: number) => void,
) {
  if (module.layout.type === "table") {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {module.items.map((item, index) => {
          const primaryFieldKey = getPrimaryFieldKey(item);
          const primaryTitle = getPrimaryFieldValue(item);
          const badge = getBadgeValue(item);
          const itemLink = moduleLinkMap[`${module.id}::items::${index}`];
          const detailEntries = Object.entries(item).filter(([key]) => key !== primaryFieldKey);

          return (
            <div
              key={`${module.id}-${index}`}
              className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold">
                  <LinkedTitle linkData={itemLink} locale={locale}>
                    {primaryTitle}
                  </LinkedTitle>
                </h3>
                {badge && (
                  <span className="rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2.5 py-1 text-xs">
                    {badge}
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {detailEntries.map(([key, value]) => (
                  <div key={key}>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--nav-theme-light))]">
                      {formatKeyLabel(key)}
                    </p>
                    {value !== undefined && renderFieldValue(value)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (module.layout.type === "card-list") {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {module.items.map((item, index) => {
          const itemLink = moduleLinkMap[`${module.id}::items::${index}`];
          const badge = getBadgeValue(item);
          const body = getBodyText(item);
          const support = getSupportText(item);

          return (
            <div
              key={`${module.id}-${index}`}
              className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
            >
              {badge && (
                <span className="mb-3 inline-flex rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2.5 py-1 text-xs">
                  {badge}
                </span>
              )}
              <h3 className="mb-2 text-lg font-bold">
                <LinkedTitle linkData={itemLink} locale={locale}>
                  {getPrimaryFieldValue(item)}
                </LinkedTitle>
              </h3>
              {body && <p className="text-sm text-muted-foreground">{body}</p>}
              {support && (
                <p className="mt-3 border-t border-border/70 pt-3 text-sm text-foreground/90">
                  {support}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (module.layout.type === "step-by-step") {
    return (
      <div className="space-y-4">
        {module.items.map((item, index) => {
          const stepNumber =
            typeof item.step === "number" ? item.step : index + 1;
          const itemLink = moduleLinkMap[`${module.id}::items::${index}`];
          const badge = getBadgeValue(item);
          const body = getBodyText(item);
          const support = getSupportText(item);

          return (
            <div
              key={`${module.id}-${index}`}
              className="flex gap-4 rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)] text-lg font-bold text-[hsl(var(--nav-theme-light))]">
                {stepNumber}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold">
                    <LinkedTitle linkData={itemLink} locale={locale}>
                      {getPrimaryFieldValue(item)}
                    </LinkedTitle>
                  </h3>
                  {badge && (
                    <span className="rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2.5 py-1 text-xs">
                      {badge}
                    </span>
                  )}
                </div>
                {body && <p className="text-sm text-muted-foreground">{body}</p>}
                {support && (
                  <p className="mt-3 border-l-2 border-[hsl(var(--nav-theme)/0.4)] pl-3 text-sm text-foreground/90">
                    {support}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {module.items.map((item, index) => {
        const isOpen = expandedItems[module.id] === index;
        const itemLink = moduleLinkMap[`${module.id}::items::${index}`];
        const summary =
          typeof item.summary === "string" ? item.summary : getBodyText(item);
        const content =
          item.content !== undefined ? renderFieldValue(item.content) : null;
        const extraText = getSupportText(item);

        return (
          <div
            key={`${module.id}-${index}`}
            className="overflow-hidden rounded-xl border border-border"
          >
            <button
              type="button"
              onClick={() => toggleAccordionItem(module.id, index)}
              className="flex w-full items-center justify-between gap-4 bg-white/5 px-5 py-4 text-left transition-colors hover:bg-white/10"
            >
              <div>
                <h3 className="font-semibold">
                  <LinkedTitle linkData={itemLink} locale={locale}>
                    {getPrimaryFieldValue(item)}
                  </LinkedTitle>
                </h3>
                {summary && (
                  <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
                )}
              </div>
              <ChevronDown
                className={`h-5 w-5 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="space-y-3 border-t border-border bg-white/[0.03] px-5 py-4">
                {content}
                {extraText && (
                  <p className="text-sm text-foreground/90">{extraText}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const modules = Object.values(t.modules as Record<string, HomeModule>).sort(
    (a, b) => a.order - b.order,
  );
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://raymanlegendsretold.wiki";
  const officialSite = "https://www.ubisoft.com/en-us/games/rayman-legends-retold";
  const steamStore =
    "https://store.steampowered.com/app/4084710/Rayman_Legends_Retold/";
  const officialDiscord = "https://discord.com/invite/ubisoftofficial";
  const officialX = "https://x.com/RaymanGame?lang=en";
  const officialYouTube = "https://www.youtube.com/watch?v=2_7BQ9hLGkk";
  const communityReddit = "https://www.reddit.com/r/Rayman/";
  const steamCommunity = "https://steamcommunity.com/app/4084710";
  const [expandedItems, setExpandedItems] = useState<Record<string, number | null>>(
    {},
  );

  const toggleAccordionItem = (moduleId: string, index: number) => {
    setExpandedItems((current) => ({
      ...current,
      [moduleId]: current[moduleId] === index ? null : index,
    }));
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Rayman Legends Retold Wiki",
        description:
          "Track Rayman Legends Retold release date, platforms, editions, couch co-op details, new realms, and official trailers.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Rayman Legends Retold key art",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Rayman Legends Retold Wiki",
        alternateName: "Rayman Legends Retold",
        url: siteUrl,
        description:
          "Fan-made Rayman Legends Retold resource hub for release details, editions, platforms, co-op features, and official media.",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Rayman Legends Retold Wiki hero image",
        },
        sameAs: [
          officialSite,
          steamStore,
          officialDiscord,
          communityReddit,
          officialX,
          officialYouTube,
        ],
      },
      {
        "@type": "VideoGame",
        name: "Rayman Legends Retold",
        gamePlatform: [
          "PlayStation 5",
          "Xbox Series X|S",
          "Nintendo Switch 2",
          "PC",
        ],
        applicationCategory: "Game",
        genre: ["Platformer", "Action", "Adventure"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 4,
        },
        offers: {
          "@type": "Offer",
          price: "39.99",
          priceCurrency: "USD",
          availability: "https://schema.org/PreOrder",
          url: steamStore,
        },
      },
      {
        "@type": "VideoObject",
        name: "Rayman Legends Retold - Official Reveal Trailer",
        description:
          "Official Ubisoft reveal trailer for Rayman Legends Retold.",
        uploadDate: "2026-06-02",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/2_7BQ9hLGkk",
        url: officialYouTube,
      },
    ],
  };

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <aside
        className="hidden xl:block fixed top-20 w-40 z-10"
        style={{ left: "calc((100vw - 896px) / 2 - 180px)" }}
      >
        <SidebarAd
          type="sidebar-160x300"
          adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X300}
        />
      </aside>

      <aside
        className="hidden xl:block fixed top-20 w-40 z-10"
        style={{ right: "calc((100vw - 896px) / 2 - 180px)" }}
      >
        <SidebarAd
          type="sidebar-160x600"
          adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X600}
        />
      </aside>

      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <a
                href={officialSite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </a>
              <a
                href={steamStore}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnSteamCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      <section id="official-trailer" className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="2_7BQ9hLGkk"
              title="Rayman Legends Retold - Official Reveal Trailer"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {t.tools.cards.map((card: any, index: number) => {
              const targetModule = modules[index];
              if (!targetModule) return null;

              return (
                <button
                  key={targetModule.id}
                  onClick={() => scrollToSection(targetModule.id)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {modules.map((module, index) => {
        const ModuleIcon = MODULE_ICON_MAP[module.id] || Sparkles;

        return (
          <section
            key={module.id}
            id={module.id}
            className={`scroll-mt-24 px-4 py-14 md:py-20 ${index % 2 === 1 ? "bg-white/[0.02]" : ""}`}
          >
            <div className="container mx-auto max-w-5xl">
              <div className="mb-8 text-center md:mb-12 scroll-reveal">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.08)] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--nav-theme-light))]">
                  <ModuleIcon className="h-4 w-4" />
                  <span>{module.eyebrow}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
                  <LinkedTitle linkData={moduleLinkMap[module.id]} locale={locale}>
                    {module.title}
                  </LinkedTitle>
                </h2>
                <p className="mx-auto max-w-3xl text-base font-medium text-foreground/90 md:text-lg">
                  {module.subtitle}
                </p>
                <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                  {module.intro}
                </p>
              </div>

              <div className="scroll-reveal">
                {renderModuleItems(
                  module,
                  moduleLinkMap,
                  locale,
                  expandedItems,
                  toggleAccordionItem,
                )}
              </div>
            </div>

            {(index + 1) % 2 === 0 && index !== modules.length - 1 && (
              <>
                <AdBanner
                  type="banner-300x250"
                  adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
                  className="mt-10 md:hidden"
                />
                <AdBanner
                  type="banner-468x60"
                  adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
                  className="mt-10 hidden md:flex"
                />
              </>
            )}
          </section>
        );
      })}

      <section className="px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="scroll-reveal rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-yellow-400" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-yellow-400">
                  Need official follow-up?
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  For bug reports, launch updates, and store-specific questions,
                  keep Ubisoft, Steam, and the community channels handy while the
                  game is still approaching release.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={officialDiscord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-4 py-2 text-sm transition-colors hover:bg-[hsl(var(--nav-theme)/0.2)]"
                  >
                    Discord <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={steamCommunity}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-4 py-2 text-sm transition-colors hover:bg-[hsl(var(--nav-theme)/0.2)]"
                  >
                    Steam Community <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
          communityHref={officialDiscord}
          gameHref={steamStore}
        />
      </Suspense>

      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href={officialDiscord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href={officialX}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href={communityReddit}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href={steamStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
