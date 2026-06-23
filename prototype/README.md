# Shoreline — Homepage Prototype

A self-contained, browser-openable homepage prototype for **Coastal Threads NC**, built to lock the
visual direction before the Liquid sections are finalized. Open `homepage.html` directly in any
browser — no build step, no store push.

## Direction
A blend of the three reference sites layered over the existing coastal DNA:
- **Dark Seas** → cinematic full-bleed hero + drop banner, gradient overlays, parallax
- **Scout Motors** → oversized Playfair headlines, bold story split, scroll-driven reveals
- **Clicks** → clean editorial collection grid, generous whitespace, crisp product cards
- **Coastal Threads** → ocean-navy / aqua / sand palette, Playfair + DM Sans, animated wave divider

## Design tokens
Mirrors `theme/assets/base.css` exactly so this doubles as the visual spec:
`--color-navy #0d2535` · `--color-aqua #93e9be` · `--color-sage #7ab5a0` · `--color-sand #c4956a` ·
`--color-bg #faf8f5` · Playfair Display headings · DM Sans body · DM Mono labels.

## Section → Horizon/Shoreline mapping
| Prototype block | Maps to section/snippet |
|---|---|
| Announcement rotator | `sections/announcement-bar.liquid` |
| Transparent→frosted sticky header | `sections/header.liquid` + `assets/header.js` |
| Cinematic parallax hero | `sections/hero.liquid` |
| Wave divider | inline SVG / `snippets` motif |
| Marquee | new `sections/marquee.liquid` |
| Collection grid | `sections/collection-grid.liquid` |
| Product rail (quick-add, wishlist, stars) | `sections/product-carousel.liquid` + `snippets/product-card.liquid`, `judgeme-stars.liquid` |
| Story split | `sections/media-text.liquid` |
| Drop banner + countdown | new `sections/feature-banner.liquid` |
| Reviews / UGC | `sections/testimonials.liquid` (Judge.me hybrid) |
| Newsletter | `sections/newsletter.liquid` |
| Footer | `sections/footer.liquid` |

## Notes
- Hybrid app strategy reflected: **native** wishlist heart, quick-add, recently-viewed-style rail;
  **Judge.me** stars/badge kept and styled to match.
- Imagery is Unsplash placeholder; fonts via Google Fonts. Both swap for store assets at build time.
- Respects `prefers-reduced-motion`.
