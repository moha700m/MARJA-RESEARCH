# AGENTS.md — MARJA Research

## Product goal
Build a premium Arabic RTL research-support storefront where visitors can understand services, inspect credible sample work, estimate price, submit an order, and track it by reference number.

## Required workflow
1. Create a backup/version checkpoint before risky changes.
2. Work on a feature branch named `agent/<short-description>` for material changes.
3. Run `npm install`, `npm run typecheck`, and `npm run build` before considering a change done.
4. Deploy a Vercel Preview from the branch when possible.
5. Review mobile + desktop and the request/tracking flow before merging to `main`.
6. Production should come from `main`.

## Current architecture
- React 19 + Vite + TypeScript.
- Motion for React for interface animation.
- `src/lib/api.ts` is a portable browser API wrapper.
- `vercel.json` temporarily proxies `/api/*` to the existing AppDeploy backend so request creation and tracking continue working.
- Do not remove that rewrite until the request/tracking backend is migrated and verified on a durable store such as Neon or Supabase.

## Highest-priority next feature: Full Research Preview Experience
The current sample modal is intentionally only a lightweight preview. Replace/extend it with a premium, complete research-document viewer that feels like a delivered research project.

Expected experience:
- Full-screen or dedicated shareable sample route.
- Realistic cover page and project metadata.
- Abstract / executive summary.
- Table of contents.
- Introduction and research problem.
- Literature review sample pages.
- Methodology page.
- Results or expected-results section only when appropriate; never fabricate completed study results.
- Tables and charts designed as sample/demo data when needed and explicitly marked as demo.
- Discussion / implications.
- References section in the relevant citation style.
- Appendices such as questionnaire/codebook when relevant.
- Page navigation (`1 / N`), section navigation, zoom, keyboard controls, responsive mobile reading mode.
- Strong CTA: request a project at this level.
- Different document structures by research type rather than one repeated template.

## Portfolio truthfulness
- `The Silent Safety Signal` is the documented internal project currently highlighted.
- Other portfolio entries are showcase samples built to demonstrate capability.
- Never label a showcase as a real client engagement, completed thesis, achieved grade, accepted publication, or real statistical result unless evidence exists.

## Design direction
- Arabic RTL first.
- Premium editorial/research aesthetic; clean rather than crowded.
- Current palette: warm off-white, dark green/charcoal, coral accent.
- Prefer subtle 21st.dev-inspired composition patterns and Motion for React animations.
- Preserve fast loading and mobile-first usability.
- Avoid animation repetition or excessive motion.

## API and privacy
- Never expose private request details in public tracking results.
- Current tracking should only show safe fields such as title, service, status and deadline.
- Do not commit secrets or tokens.
- During backend migration, preserve existing request IDs and behavior where feasible.

## Recommended backend migration
1. Create durable schema for requests.
2. Migrate create/read behavior.
3. Verify request submission + tracking on preview.
4. Switch `/api/*` to the new Vercel/backend implementation.
5. Only then remove the AppDeploy rewrite.
