# مَرجِع — Design System

## Design read
Arabic RTL academic-services landing page for university students. The surface must feel premium, trustworthy, fast, and contemporary without looking like a generic AI/SaaS template.

## Taste dials
- DESIGN_VARIANCE: 7/10
- MOTION_INTENSITY: 7/10 for marketing and research previews; 3/10 for forms and repeated controls
- VISUAL_DENSITY: 5/10

## Visual language
- Base: warm ivory + tinted deep green
- Accent: coral/orange only; do not add purple/blue AI glows to the marketing surface
- Typography: strong Arabic display hierarchy, compact metadata, generous body leading
- Shape: mixed radii, asymmetric editorial composition, avoid equal-card grids when hierarchy matters
- Depth: borders + restrained shadows + texture/pattern; avoid glass on every surface

## Motion rules
- GSAP is for explanatory/scroll/sequenced motion: SplitText, ScrollTrigger, Flip, Observer
- Motion remains for interruptible component gestures and page transitions
- Enter/exit: ease-out, usually 160–260ms for UI
- On-screen movement: ease-in-out
- Continuous decorative motion: linear
- Press feedback: scale 0.975
- Never animate repeated keyboard actions
- Respect prefers-reduced-motion
- No bounce/elastic defaults

## Research previews
Each research sample has its own visual system and methodology-driven scene language. Never collapse all research into one generic template.

Research Story Mode is deterministic and seekable: six scenes, play/pause, scene navigation, timeline scrubber, keyboard support. It is inspired by HyperFrames' scene/timeline model but runs entirely in-browser.

## Mobile interaction
Use the local quick drawer pattern instead of adding Vaul as a dependency because the upstream Vaul repository declares itself unmaintained. Drawer behavior must support swipe-down dismissal, compact/full states, Escape, and accessible dialog semantics.

## Notifications
Use Sonner for transient success/error feedback. Keep inline form errors as the source of truth; toasts supplement them and never replace accessible text.

## Hardening checklist
- Focus-visible on all interactive controls
- No `transition: all`
- No scale(0) entrances
- No fabricated research results
- RTL and mobile overflow review
- Long titles truncate only in chrome; research body text must remain readable
- Production gate: npm install → npm run typecheck → npm run build
