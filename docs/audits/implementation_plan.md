# Implementation Plan — Phase 06J-UX-D: Production Cutover

Execute the controlled production cutover of the approved Corporate Website V2 to the root production domain: **`https://www.huycncdsai.io.vn/`**.

## User Review Required

> [!IMPORTANT]
> **Production Safety Invariant**: This phase promotes the approved frontend code from `feature/06j-ux-b-corporate-v2-preview` to `main` and Vercel Production.
> **STRICT ZERO-MUTATION BOUNDARY**:
> - Supabase schema: ZERO CHANGES
> - Supabase migrations: ZERO NEW MIGRATIONS
> - Supabase AI tables: ZERO TOUCH
> - Agent registry: 0 SEEDED
> - PGMQ / ai-jobs: ZERO QUEUE WRITES
> - Dispatcher / Dell M4800: NOT DEPLOYED / OFFLINE

## Proposed Execution Sequence

### Phase 1: Baseline Capture & Rollback Reference
1. Record current `main` commit SHA (`7f3dfdf7f5c0fe59381da431bff7bc473082f5bc`).
2. Record current production deployment ID & status (`HTTP 200` at `https://www.huycncdsai.io.vn/`).
3. Create Git rollback tag:
   ```bash
   git tag -a pre-corporate-v2-cutover-2026-09-21 -m "Pre-V2 production baseline backup before Phase 06J-UX-D cutover"
   ```

### Phase 2: Root Route & Legacy Shell Cutover (on feature branch)
1. **Preserve Legacy Home**:
   - Copy existing `src/app/page.tsx` to `src/app/archive/home-v1/page.tsx` (set `robots: { index: false, follow: false }`).
2. **Promote V2 to Root**:
   - Update `src/app/page.tsx` to render `<CorporateHomePageV2 />` with production metadata:
     - Title: `HUY TECHNOLOGY AI GROUP | Hệ sinh thái AI Agency & Tự động hóa`
     - Description: `Hệ sinh thái công nghệ kết nối các giải pháp AI, Tự động hóa, Giáo dục số, Pháp lý thuế và Truyền thông chuyên biệt trên nền tảng điều phối đa tác tử an toàn theo chuẩn HAIP/1.0.`
     - Canonical: `https://www.huycncdsai.io.vn/`
     - Robots: `index: true, follow: true`
3. **Legacy Shell Isolation for Root**:
   - In `src/components/LegacyShellWrapper.tsx`: Exclude legacy header, bottom nav, and footer when `pathname === "/" || pathname.startsWith("/v2")`. Existing legacy routes (`/about`, `/courses`, `/resources`, etc.) remain in the legacy shell.
4. **Wire Production Contact Form**:
   - In `src/components/v2/FinalCTA.tsx`: Connect submission to the verified server action `submitContact` from `@/actions/contact` (storing to baseline `contacts` and `leads` tables without exposing any privileged API keys).
5. **SEO & Duplicate Content Protection**:
   - In `next.config.ts` and `src/app/v2/page.tsx`: Set canonical to `https://www.huycncdsai.io.vn/`. In production, redirect `/v2` to `/`. In preview, allow `/v2` to render for preview verification.

### Phase 3: Pre-Production Rehearsal & Verification
1. Run local TypeScript check (`npx tsc --noEmit`) and production build (`npm run build`).
2. Run monorepo tests (`npm test` in `huy-ai-center`, 58/58 passing).
3. Commit cutover changes to `feature/06j-ux-b-corporate-v2-preview`.
4. Push to remote origin and let Vercel create a rehearsal preview deployment.
5. Verify preview root (`/`) displays the full Corporate V2 experience.

### Phase 4: Controlled Merge to Main
1. Fast-forward / merge `feature/06j-ux-b-corporate-v2-preview` into `main`.
2. Push `main` to `origin/main`.
3. Push rollback tag `pre-corporate-v2-cutover-2026-09-21` to origin.
4. Monitor Vercel automatic production deployment.

### Phase 5: Post-Deployment Smoke Verification & Documentation
1. Verify `https://www.huycncdsai.io.vn/`:
   - HTTP 200, TLS valid, Corporate V2 shell, no legacy chrome.
   - Robots allow indexation (`robots: index, follow`).
   - Mobile menu, responsive behavior, external links.
   - Contact form verified.
2. Capture 8 production screenshots in `screenshots-v2-production/`.
3. Generate all required reports:
   - `docs/PHASE_06J_UX_D_PRODUCTION_CUTOVER_REPORT.md`
   - `docs/ui-ux/V2_PRODUCTION_SMOKE_REPORT.md`
   - `docs/ui-ux/V2_PRODUCTION_SEO_REPORT.md`
   - `docs/ui-ux/V2_PRODUCTION_SECURITY_REPORT.md`
   - `docs/ui-ux/V2_PRODUCTION_ROLLBACK_PLAN.md`
4. Update `PROJECT_STATE.md`.
5. Enforce **HARD STOP**.

## Verification Plan

### Automated Tests
- `npx tsc --noEmit` in `edtech-ai-portfolio` (0 errors)
- `npm run build` in `edtech-ai-portfolio` (56/56 routes compiled)
- `npm test` in `huy-ai-center` (58/58 tests passing)
- Puppeteer smoke test on `https://www.huycncdsai.io.vn`

### Manual Verification
- Visual inspection of the 8 production screenshots
- Curl verification of production HTTP status and headers
