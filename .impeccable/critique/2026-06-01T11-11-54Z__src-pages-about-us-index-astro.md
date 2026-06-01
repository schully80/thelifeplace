---
target: about us page
total_score: 29
p0_count: 0
p1_count: 0
timestamp: 2026-06-01T11-11-54Z
slug: src-pages-about-us-index-astro
---
# About Us Page Critique

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active nav, service strip, and final CTA give clear orientation. |
| 2 | Match System / Real World | 3 | Language is clearer for young urban visitors, though some belief content still points to a deeper page. |
| 3 | User Control and Freedom | 3 | Clear routes to visit, live, leadership, and beliefs. |
| 4 | Consistency and Standards | 3 | Cards/icons now align with homepage card standards. |
| 5 | Error Prevention | 3 | Static page, low-risk; directions and visit paths reduce visitor confusion. |
| 6 | Recognition Rather Than Recall | 3 | Key visitor details are visible without relying on navigation. |
| 7 | Flexibility and Efficiency | 3 | Users can continue through visit, live, leadership, or beliefs paths. |
| 8 | Aesthetic and Minimalist Design | 3 | Page is much simpler; strongest remaining noise is global cookie/contact overlay behavior. |
| 9 | Error Recovery | 2 | Mostly not applicable to this static page. |
| 10 | Help and Documentation | 3 | Practical visit details and deeper belief/leadership links are present. |
| **Total** | | **29/40** | **Good: the page now has clear structure, stronger language, and better polish.** |

## Anti-Patterns Verdict

The page no longer reads like a generic values poster. The strongest improvements are the exact vision statement in the hero, practical service/location strip, simplified values copy, homepage-aligned card treatment, and plain-language beliefs teaser. It still uses a familiar church-site structure, but the local image, audience-specific copy, and restrained styling keep it grounded.

Deterministic scan was unavailable because the bundled detector entrypoint is missing.

## Priority Issues

### [P2] Global overlays still compete with mobile reading

**Why it matters**: The cookie banner and contact FAB can cover the first practical content on mobile screenshots.

**Fix**: Address globally, not in this page: make cookie/contact placement less intrusive on first load.

### [P3] Leadership image lazy loading appears blank in full-page screenshots

**Why it matters**: The image loads correctly when scrolled into view, but full-page automation can capture the lazy placeholder.

**Fix**: Leave as-is for performance, or use eager loading if screenshot aesthetics matter more than page weight.

## What's Working

- The hero now uses the exact vision statement.
- The page answers practical visitor questions quickly.
- The values section uses the project card and icon standards.
- The copy is simpler and less church-heavy.
- The beliefs section now works as a plain-language bridge instead of a dense doctrine block.

## Questions To Consider

1. Should the global cookie/contact overlays be redesigned next for mobile?
2. Should the leadership photo load eagerly on About, or stay lazy for performance?
