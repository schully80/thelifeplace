---
target: about us page
total_score: 24
p0_count: 0
p1_count: 2
timestamp: 2026-06-01T10-00-19Z
slug: src-pages-about-us-index-astro
---
# About Us Page Critique

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active nav and live banner communicate state, but the About page itself has no progress or next-step signal. |
| 2 | Match System / Real World | 3 | Warm, Jesus-centered language fits the church, but the page skips concrete visitor questions: who leads, where, when, and what happens Sunday. |
| 3 | User Control and Freedom | 3 | Global nav gives exits, but the page ending offers no actionable route after "Join us this Sunday." |
| 4 | Consistency and Standards | 2 | Footer "About" links home, page label says "What We Do," title says "About Us," and the page description promises story/leadership not shown here. |
| 5 | Error Prevention | 3 | Low-risk static page; no forms here. The main preventable issue is copy and link ambiguity. |
| 6 | Recognition Rather Than Recall | 2 | Users can find nav, but contact/social controls are icon-only and the primary visitor action is absent in the page body. |
| 7 | Flexibility and Efficiency | 2 | Multiple global paths exist, but no in-context shortcuts to Plan a Visit, Leadership, Beliefs, or Watch Live. |
| 8 | Aesthetic and Minimalist Design | 2 | Strong first image, but hierarchy is inflated, red emphasis is overused, and the value grid feels template-like. |
| 9 | Error Recovery | 2 | Mostly not applicable, but icon-only contact controls and the cookie banner can create dead-end confusion for assistive or distracted users. |
| 10 | Help and Documentation | 2 | Footer contact helps, but the About page does not answer practical first-timer concerns or link to deeper beliefs/leadership context. |
| **Total** | | **24/40** | **Acceptable: clear foundation, significant improvements needed before it feels excellent.** |

## Anti-Patterns Verdict

**Does it look AI-generated?** Somewhat, yes. The strongest AI tells are the centered-stack hero, repeated tracked section labels, oversized declarative typography, repeated red word emphasis, and the identical icon-card grid. The brand is real and the Sandton image helps, but the page structure reads like "hero statement plus value cards" rather than a specific church with a lived story.

**LLM assessment**: The page has conviction, but it is too abstract for an About page. It says what The Life Place values without helping a new visitor understand the church as a real local community. The visual grammar is also too repetitive: centered large type, red-highlighted Jesus, rounded card, repeat.

**Deterministic scan**: The bundled detector was unavailable: `node /Users/Etyang/.agents/skills/impeccable/scripts/detect.mjs --json src/pages/about-us/index.astro` returned `Error: bundled detector not found.` No detector findings were produced.

**Visual overlays**: No reliable user-visible overlay is available because the detector bundle is missing. Fallback evidence used: source review, desktop screenshot, mobile screenshot, and Playwright DOM measurement.

## Overall Impression

The page communicates theological center well, but it does not yet work hard enough as "About Us." It should build trust through local reality, leadership/story pathways, beliefs, and a clear visitor action. Right now it is more of a values poster than an about page.

## What's Working

1. The Sandton skyline gives the hero a local anchor. That is important for a church page, and it avoids abstract stock-photo spirituality.
2. The repeated "Come. See. Jesus." brand line is clear and memorable.
3. The five values are concise enough to scan, and the scripture references add substance for users who care about theological grounding.

## Priority Issues

### [P1] The page has no primary action in the page body

**Why it matters**: The product context says first visits are the top priority, but the About page ends with "Join us this Sunday" and no button, service time, location, or path to the visit flow. A first-time visitor has to leave the page and use the global nav.

**Fix**: Add an in-context CTA block after the hero or final invitation: `Plan A Visit`, `Meet Our Leaders`, and `What We Believe`. Include Sunday time and Sandton/Craigavon location in plain text. The final invitation should contain a real button to `/visit/`.

**Suggested command**: `impeccable clarify about us page`

### [P1] The hero is emotionally strong but informationally thin

**Why it matters**: On desktop, the hero occupies roughly 1,336px of height. On mobile, it uses most of the first screen before the user gets any practical orientation. The headline also lacks punctuation around "true good beautiful and kind," which makes it harder to parse.

**Fix**: Tighten the hero height, remove the forced line break, punctuate the phrase, and add one practical sentence below the mission: "A Jesus-centered church meeting Sundays in Sandton." Keep the image, but let the first fold hint at the next section.

**Suggested command**: `impeccable layout about us page`

### [P2] The values section overuses the card-grid template

**Why it matters**: Five nearly identical cards with centered icons, headings, copy, and references create a generic church-template feel. It also weakens hierarchy because all values look equally loud and equally boxed.

**Fix**: Make the values feel more authored. Use a numbered editorial list, a two-column "value + lived expression" layout, or one featured lead value with four quieter follow-ups. Reduce shadows and reserve cards for truly separate objects.

**Suggested command**: `impeccable bolder about us page`

### [P2] The page promises story and leadership but does not deliver them

**Why it matters**: The meta description says "our story, core values, and leadership team," but the visible page only shows vision and values. Trust-building content is pushed into nav/footer links instead of being part of the About narrative.

**Fix**: Add a short story section, a leadership teaser with the founders image, and a beliefs teaser. Each should be a bridge, not a full duplicate: 2-3 sentences and a clear link.

**Suggested command**: `impeccable shape about us page`

### [P3] Mobile has too many overlays competing with the first impression

**Why it matters**: On mobile, the cookie banner, floating contact button, and hero text stack into a dense first-screen experience. The final hero line is partially competing with the cookie panel, and the user sees compliance UI before a useful invitation.

**Fix**: Reposition or delay the contact FAB on first paint, reduce hero vertical density, and ensure the cookie banner does not cover critical page copy. Keep touch targets, but reduce first-fold competition.

**Suggested command**: `impeccable adapt about us page`

## Persona Red Flags

**Jordan, First-Time Visitor**: Jordan lands on About to understand "Is this church for me?" The page gives values but not Sunday time, what to expect, how to visit, or a direct Plan a Visit button. "What We Do" as the first label also does not match the page title "About Us," which adds a small but real orientation cost.

**Casey, Distracted Mobile User**: Casey sees a tall hero, dense headline, cookie banner, and floating contact affordance at once. The primary action is not in thumb reach because there is no in-page primary action. They must open the hamburger or scroll to the footer to act.

**Sam, Accessibility-Dependent User**: Sam gets semantic headings, which is good, but several important controls in the global shell are icon-only. The page also relies on red emphasis inside repeated text; if color is not perceived, the emphasis loses meaning. The long scripture references inside small italic text are likely tiring at zoom.

**Local Explorer, Church Shopper**: This person is comparing churches before attending. The page does not show people, leaders, service expectations, or a clear local story. The skyline says Johannesburg/Sandton, but the content does not yet make the community feel tangible.

## Minor Observations

- [src/pages/about-us/index.astro:3] and [src/pages/about-us/index.astro:4] import `FullBleed` and `FadeDivider` but do not use them.
- [src/pages/about-us/index.astro:9] and [src/pages/about-us/index.astro:10] use em dashes in metadata, despite the design rules banning em dashes in copy.
- [src/pages/about-us/index.astro:34] uses an em dash in visible copy.
- [src/pages/about-us/index.astro:43] says the values section was copied from `test-values`, which hints at unfinished implementation history.
- [src/pages/about-us/index.astro:48] and [src/pages/about-us/index.astro:49] repeat "Our Values" / "Our Core Values."
- [src/pages/about-us/index.astro:54] uses a forced `<br>`, which contributes to rigid mobile composition.
- [src/pages/about-us/index.astro:77] uses a spaced hyphen in prose. Use punctuation that reads intentionally.
- [src/pages/about-us/index.astro:116] to [src/pages/about-us/index.astro:125] has the right invitation but no link.

## Questions to Consider

1. What is the main job of this page: explain beliefs, build trust in the people, or convert a first-time visit?
2. Would a stranger understand where and when to show up without using the nav?
3. What would make this feel like The Life Place specifically, not a church values template?
4. Should "Jesus" be red every time, or only where the emphasis creates a meaningful pause?
