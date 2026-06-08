---
target: leadership page
total_score: 22
p0_count: 0
p1_count: 2
timestamp: 2026-06-01T11-37-37Z
slug: src-pages-about-us-leadership-astro
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | External card links have hover states, but no destination/after-click clarity and no visible current page cue inside the leadership content. |
| 2 | Match System / Real World | 2 | Leadership story starts warmly, then abruptly becomes Subscribe/Partner/Give without pastoral framing. |
| 3 | User Control and Freedom | 3 | Navigation and footer exits exist; external links open new tabs. The page lacks a clear in-page next step after the final invitation. |
| 4 | Consistency and Standards | 2 | Repeated `h1`, inconsistent card treatments, unused motion classes, and a centered final CTA with no action weaken system discipline. |
| 5 | Error Prevention | 2 | QR-first giving cards depend on scanning behavior even though users are already on a device; missing image alt text reduces assistive reliability. |
| 6 | Recognition Rather Than Recall | 3 | Labels are mostly visible and plain; users can understand Substack, SnapScan, PayPal, but the relationship to leadership must be inferred. |
| 7 | Flexibility and Efficiency | 2 | There are direct tap links, but no consolidated choice or preferred route. Three external actions compete equally. |
| 8 | Aesthetic and Minimalist Design | 2 | The hero is calm, but large spacer divs, oversized gaps, QR cards, and a floating cookie banner create visual noise. |
| 9 | Error Recovery | 2 | No local error states are involved; external payment/subscription failures have no fallback beyond footer/contact. |
| 10 | Help and Documentation | 2 | Contact info exists in the footer, but there is no contextual reassurance around giving, Substack, or why partnership belongs here. |
| **Total** | | **22/40** | **Acceptable, but trust and hierarchy need work before this feels finished.** |

## Anti-Patterns Verdict

**LLM assessment**: This does not scream AI-generated at first glance because the real founders photo and direct Jesus-centered copy give it a human center. The risk is more "assembled from page fragments" than generic AI slop: a strong personal hero, then a QR/payment block that feels imported from a giving page, then a final invitation without a button. The page has the brand's restraint, but not enough editorial intent.

**Deterministic scan**: Attempted with `node /Users/Etyang/.agents/skills/impeccable/scripts/detect.mjs --json src/pages/about-us/leadership.astro`; it failed with `Error: bundled detector not found.` No automated rule counts are available. Manual source review found repeated `h1` markup at lines 35 and 72, QR images without `alt` at lines 127 and 141, unused imported `FadeDivider` at line 3, dead motion CSS/JS at lines 196-238, spacer divs at lines 94 and 100, and an unclosed final paragraph at lines 191-193.

**Visual overlays**: No reliable user-visible overlay is available because the detector entrypoint is missing, so there was no `detect.js` to inject. Browser evidence came from Playwright screenshots and DOM metrics across desktop, tablet, and mobile.

## Overall Impression

The top half is the page. The founders photo, name, and short testimony feel real, warm, and on-brand. The bottom half weakens the page by shifting from leadership trust to monetized actions too abruptly. The single biggest opportunity is to turn this into a coherent leadership narrative with one clear next step, then move giving/QR mechanics into a better-framed secondary section or the dedicated giving page.

## What's Working

1. The real founders image does important trust work. It avoids abstract church-template imagery and gives visitors a concrete person-to-person signal.
2. The opening copy is plain and pastoral. It uses the brand language, keeps Jesus central, and avoids heavy internal church jargon.
3. The restrained red usage mostly aligns with the system. Red marks Jesus, The Life Place, and active actions rather than becoming generic decoration.

## Priority Issues

**[P1] The page changes jobs halfway down**

**Why it matters**: A leadership page should answer "Who are these people, can I trust them, and what kind of church are they leading?" The Connect/Partner/Subscribe block asks users to subscribe and donate before the leadership story has matured. For first-time visitors, that can feel transactional.

**Fix**: Reframe the second section around trust and pastoral context: "From our leaders" or "A note from Schulter". Keep Substack as a writing/resource action. Move SnapScan and PayPal either to `/give/` or make them a quieter single text link: "Want to partner financially? Give securely." Do not present three equal cards on this page.

**Suggested command**: `impeccable distill src/pages/about-us/leadership.astro`

**[P1] The final invitation has no actual action**

**Why it matters**: The page ends with "Join us this Sunday" but gives no `Plan A Visit` button, service detail, address, or directions in the immediate moment. The footer has links, but the ending misses the brand's primary visitor flow.

**Fix**: Add a compact CTA row under the final invitation: primary `Plan A Visit`, secondary `Watch Live` or `What We Believe`. Include service time/location if those are standard elsewhere. Make this the page's real conversion point.

**Suggested command**: `impeccable clarify src/pages/about-us/leadership.astro`

**[P2] Mobile card layout is cramped and QR-first**

**Why it matters**: On a phone, the QR code is not the primary behavior. Users tap. The current mobile cards keep a side-by-side QR/text structure, making text narrow and actions feel like labels instead of buttons.

**Fix**: On mobile, stack each card vertically or replace QR visuals with direct action rows. If QR codes stay, show them only at `md+` and give the mobile view larger tappable buttons with clear labels: `Read Schulter's Substack`, `Give with SnapScan`, `Give with PayPal`.

**Suggested command**: `impeccable adapt src/pages/about-us/leadership.astro`

**[P2] Structural accessibility and semantics are messy**

**Why it matters**: The DOM contains two `h1` elements, QR images without alt text, and an unclosed final paragraph. Screen reader users get duplicate page titles, unnamed QR images, and less predictable reading structure.

**Fix**: Render one `h1` only, using responsive styling instead of duplicate headings. Add useful `alt` text or mark QR images decorative if the link text fully covers the action. Close the final paragraph. Remove unused import and dead motion styles/scripts.

**Suggested command**: `impeccable harden src/pages/about-us/leadership.astro`

**[P3] Spacing is doing layout work manually**

**Why it matters**: The source uses empty spacer divs (`my-32`, `my-24`) between sections. It creates awkward desktop gaps and makes the page harder to tune responsively.

**Fix**: Put spacing on sections with responsive padding and remove empty spacer divs. Use a deliberate white/gray section rhythm rather than stacking gray panels with arbitrary gaps.

**Suggested command**: `impeccable layout src/pages/about-us/leadership.astro`

## Persona Red Flags

**Jordan, first-time visitor**: Jordan sees a warm leadership introduction, then immediately sees subscription and giving choices. The page does not answer practical trust questions such as "What should I do next if I want to visit?" The final "Join us this Sunday" has no button, so Jordan has to infer the next action from nav or footer.

**Casey, distracted mobile visitor**: Casey gets a good first screen, but the cookie banner covers the leadership copy around the transition point. The QR cards are awkward on a phone because the most prominent visual affordance is something Casey cannot easily scan from the same device. The real tap targets exist, but they are visually secondary.

**Sam, accessibility-dependent user**: Sam encounters duplicate `h1` headings and QR images with missing alt attributes. The red emphasis is visually meaningful, but the page relies on color and visual position to communicate importance. External card links also lack explicit accessible labels explaining that they open Substack, SnapScan, or PayPal in a new tab.

**Project-specific, young Johannesburg couple exploring church**: They likely want to know whether the leaders are grounded, approachable, family-aware, and connected to the local church community. The page gives a personal testimony, but it does not show how Schulter and Genevieve shepherd the church, serve families, or connect leadership to Sunday life.

## Minor Observations

- The `CONNECT • PARTNER • SUBSCRIBE` heading feels loud and administrative compared with the warmth of the hero.
- The desktop hero uses justified paragraph text, which creates uneven word spacing and feels less natural than a clean left-aligned rag.
- The founders photo is strong, but the crop could be slightly more intentional on mobile so faces sit with more breathing room.
- The cookie banner is globally controlled, but on this page it visually interrupts the most important story section on mobile.
- The imported `FadeDivider` is unused, and the `.motion-card` / `.value-card` code appears copied from another page.

## Questions to Consider

- What should a visitor believe about the church after meeting its leaders on this page?
- Should financial partnership be a leadership-page action, or should leadership simply point to the dedicated giving flow?
- What is the one next step this page should earn: visit, read more, contact, or give?
- Would the page feel more trustworthy if it included a short note about how the leaders serve families, professionals, and the local community?
