# Copilot Instructions for NotionNext

## Architecture Overview

**NotionNext** is a Next.js 14+ static blog system powered by Notion API. It transforms Notion databases into multi-theme, multi-language blogs deployed on Vercel.

### Data Flow
1. **Notion API** → `lib/notion/getNotionAPI.js` (via notion-client library)
2. → `lib/db/getSiteData.js` (converts Notion records to site data with caching)
3. → Pages via `getStaticProps` (build-time data fetching)
4. → Dynamic theme system (`themes/[theme]/index.js`)
5. → `NotionPage` component (`components/NotionPage.js`) renders via react-notion-x

### Configuration Layers (Priority Order)
1. **Notion Config Table** (runtime, most flexible)
2. **Environment Variables** (`process.env.*`)
3. **blog.config.js** + `/conf/*.config.js` (modular settings)
4. **Theme-specific configs** (optional per theme)

Use `siteConfig(key, defaultVal, extendConfig)` from `lib/config.js` to read config respecting this hierarchy.

## Key File Locations

- **Blog Config**: `blog.config.js` (entry point), `/conf/*.config.js` (modular: comment, analytics, ad, widget, etc.)
- **Data Fetching**: `lib/db/getSiteData.js` → `lib/notion/getPostBlocks.js`
- **Theme System**: `themes/` (17+ themes), `themes/theme.js` (dynamic loader)
- **Layout Mapping**: `blog.config.js::LAYOUT_MAPPINGS` (customize routes → theme layouts)
- **Middleware**: `middleware.ts` (Clerk auth, UUID redirect support, route protection)
- **Components**: Reusable UI in `components/`, theme-specific in `themes/[theme]/components/`

## Critical Workflows

### Multi-language Support
- Set `NOTION_PAGE_ID` with prefixes: `"pageId1,zh:pageId2,en:pageId3,jp:pageId4"`
- Extract lang in `lib/utils/pageId.js::{extractLangPrefix,extractLangId}`
- Locales auto-detected; use `lib/lang/[lang].js` for translations

### Theme System
- **Add Theme**: Create `themes/[theme-name]/index.js` exporting `default` component
- **Include**: `lib/lib.tsx` dynamically imports via `DynamicLayout`
- **Config**: Export `THEME_CONFIG` object from theme entry; read via `getThemeConfig()`
- **Components**: Store theme UI in `themes/[theme-name]/components/`

### Static Generation
- **Pages use `getStaticPaths`/`getStaticProps`**: `pages/page/[page].js`, `pages/tag/[tag]/page/[page].js`
- **Data revalidated** every `NEXT_REVALIDATE_SECOND` (default 60s)
- **Caching**: `lib/cache/cache_manager.js` memoizes Notion API calls
- **Rate Limiting**: `lib/notion/RateLimiter.js` throttles API during builds (200ms default)

### Notion Integration
- **Custom Fields**: Define in `conf/notion.config.js::NOTION_PROPERTY_NAME`
- **Database Views**: Select view via `NOTION_INDEX` (0-indexed; use -1 for last)
- **Data Schema**: `getAllPageIds()`, `getPageProperties()`, `getAllCategories/Tags` in `lib/notion/`

## Build & Development

### Commands
- `npm run dev` — Development server
- `npm run build` — Production build (enables `BUILD_MODE=true`)
- `npm run lint:fix && npm run format && npm run type-check` — Pre-commit checks
- `npm run pre-commit` — Full lint/format/type check
- `npm run export` — Static export (standalone HTML)
- `npm run health-check` — Validate setup

### Environment Setup
- Node ≥20, npm ≥8
- `NOTION_PAGE_ID` and `NEXT_PUBLIC_*` variables in `.env.local`
- Optional: Clerk auth (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
- Optional: Analytics, ads, comments in `conf/*.config.js`

## Common Patterns

### Adding a New Feature
1. **Config**: Add to relevant `/conf/*.config.js` or `blog.config.js`
2. **Component**: Create in `components/` (shared) or `themes/[theme]/components/` (theme-specific)
3. **Integration**: Use `NotionPage` props or `useGlobal()` hook for config access
4. **Dynamic Load**: Wrap heavy components with `dynamic(() => import(...), { ssr: false })`

### Modifying Theme
1. Theme is string: `blog.config.js::THEME` or `NEXT_PUBLIC_THEME` env var
2. Theme dir structure: `index.js` (main), `components/`, `styles/` (optional)
3. Use `LayoutPostList`, `LayoutSlug`, etc. layout names (defined per theme)
4. Theme switching: Query param `?theme=nextTheme` loads at runtime

### Custom Routes/Layouts
- `blog.config.js::LAYOUT_MAPPINGS` maps routes to theme layout components
- E.g., `/custom-page` → specific layout without blog styling

## TypeScript & Type Safety

- Core types in `types/index.ts`: `NotionPage`, `NotionPost`, `SiteConfig`, `ThemeConfig`
- API types in `pages/api/auth/callback/notion.ts`
- Run `npm run type-check` before commits

## Performance Optimization

- **Image Compression**: `lib/notion/mapImage.js::compressImage()`; config via `IMAGE_COMPRESS_WIDTH`
- **Code Splitting**: `next/dynamic` for theme/component lazy-loading
- **Caching Strategy**: Notion data cached per `pageId`; Redis via `ioredis` optional
- **Bundle Analysis**: `npm run bundle-report` to inspect sizes

## Authentication & Authorization

- Optional **Clerk** integration for user auth
- Routes protected via `isTenantRoute`, `isTenantAdminRoute` in `middleware.ts`
- **UUID Redirect**: Enable `UUID_REDIRECT=true` to map Notion IDs → slugs via `redirect.json`

## Common Gotchas

1. **Config Priority**: Theme config overrides blog.config; Notion config overrides env vars
2. **Multi-page builds**: Ensure `NEXT_REVALIDATE_SECOND` is reasonable (high = stale content risk)
3. **Notion API limits**: Rate limiter essential for large databases; tune `RateLimiter` if timeouts occur
4. **Language prefix format**: `"id,zh:id,en:id"` → underscore errors if malformed
5. **Dynamic imports**: Avoid `ssr: true` for client-only Notion rendering components

## Debugging

- Enable `DEV_LOG` or `DEBUG=*` in dev mode
- Check `BUNDLE_ANALYZER` to prevent fake data in builds
- Notion API errors logged in `lib/notion/getNotionAPI.js::callNotion()`
- Theme loading errors caught in `themes/theme.js::getThemeConfig()`
