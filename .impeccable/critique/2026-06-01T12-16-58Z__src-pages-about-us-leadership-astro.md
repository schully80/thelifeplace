---
target: about us/leadership page
total_score: 28
p0_count: 0
p1_count: 1
timestamp: 2026-06-01T12-16-58Z
slug: src-pages-about-us-leadership-astro
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Link states and active navigation are clear; no interaction feedback is missing for this mostly-static page. |
| 2 | Match System / Real World | 3 | The page now speaks in plain pastoral language, though the key belief statement is long enough to feel less conversational on mobile. |
| 3 | User Control and Freedom | 3 | Visitors have clear exits: Substack, Plan A Visit, Watch Live, header, and footer. |
| 4 | Consistency and Standards | 3 | One `h1`, consistent section structure, good button patterns; cookie overlay behavior weakens perceived polish. |
| 5 | Error Prevention | 3 | External Substack link is safely marked with `rel` and ARIA; no risky user input exists on this page. |
| 6 | Recognition Rather Than Recall | 3 | Page intent, leaders, and next steps are visible; the Sunday location is not reinforced in the CTA section. |
| 7 | Flexibility and Efficiency | 3 | Good simple paths for visiting, watching live, and reading more; no unnecessary choices. |
| 8 | Aesthetic and Minimalist Design | 3 | Stronger and cleaner than before, but the cookie banner covers the page's strongest message on first visit. |
| 9 | Error Recovery | 2 | No local error states; external paths have no contextual fallback beyond normal navigation/footer. |
| 10 | Help and Documentation | 2 | Footer contact helps, but there is little contextual reassurance for a first-time visitor with practical questions. |
| **Total** | | **28/40** | **Good foundation, with a few high-impact polish issues.** |

## Anti-Patterns Verdict

**LLM assessment**: This no longer looks like a generic AI church page. The real leadership photo, simplified IA, and direct Jesus-centered language give the page a coherent point of view. The main AI-slop risk is now typographic rather than structural: the large “We are intentional...” statement is doing too much as one block of headline copy, especially on mobile. It reads sincere, but the shape is heavy.

**Deterministic scan**: Attempted with `node /Users/Etyang/.agents/skills/impeccable/scripts/detect.mjs --json src/pages/about-us/leadership.astro`; it failed with `Error: bundled detector not found.` No automated rule counts are available.

**Visual overlays**: No reliable user-visible overlay is available because the detector entrypoint is missing, so there was no `detect.js` to inject. Browser evidence came from Playwright screenshots and DOM metrics across 320px, 390px, 820px, 1440px, and enlarged text.

## Overall Impression

This page is meaningfully better than the earlier critique state. It now feels like a leadership page with a clear pastoral center, not a giving/subscription hub. The single biggest opportunity is to protect the “From our leaders” statement as the page’s thesis: right now the global cookie banner covers it on first visit, which undercuts the exact message you wanted visitors to read.

## What's Working

1. The page has a clear job now. It introduces Schulter and Genevieve, states what The Life Place is about, and then gives a direct next step.
2. The real photo continues to do strong trust work. It makes the leaders feel concrete and approachable rather than abstract.
3. The technical structure is much cleaner: one `h1`, no horizontal overflow, good tap targets, safe external link attributes, and responsive behavior across tested widths.

## Priority Issues

**[P1] The cookie banner covers the page's thesis**

**Why it matters**: The most important new sentence, the “From our leaders” statement, is partially hidden by the cookie banner on mobile and desktop first visit. A visitor’s first read becomes fragmented: they see the label, then the cookie notice, then only the lower half of the headline.

**Fix**: Adjust the global cookie banner behavior or page spacing. Best fix: make the cookie banner less intrusive on content pages by anchoring lower with a smaller mobile layout after first paint, or add enough bottom-aware spacing so it does not sit directly over the second section’s headline. If changing the global banner is too broad, add page-level top spacing before “From our leaders” only when the consent banner is visible.

**Suggested command**: `impeccable polish src/components/CookieConsent.astro`

**[P2] The emphasis statement is too dense as one headline**

**Why it matters**: The sentence is the right message, but as a single heavy `h2` it becomes a wall of bold text on mobile. It is readable, but it asks visitors to parse a lot at once.

**Fix**: Keep the wording, but shape it. Example: keep “We are intentional about The Life Place being a community...” as the headline, then move “where all that we are and do communicates...” into a slightly smaller supporting line. Another option is a deliberate line break after “community” and a softer paragraph underneath.

**Suggested command**: `impeccable typeset src/pages/about-us/leadership.astro`

**[P2] The leadership story still lacks concrete visitor reassurance**

**Why it matters**: The page says the leaders care about people seeing Jesus, but it does not yet show what that means for young couples, families, professionals, or first-time visitors. The brand goal is trust through local and practical clarity.

**Fix**: Add one compact paragraph after the leadership intro or after the thesis: “That shapes how we welcome families, teach the Bible, pray, serve, and make room for people exploring faith.” Keep it concrete and not churchy.

**Suggested command**: `impeccable clarify src/pages/about-us/leadership.astro`

**[P3] The final visit CTA could carry more practical context**

**Why it matters**: “We meet every Sunday from 9:00 to 11:00. Welcome.” is clear but thin. A first-time visitor often needs location confidence before clicking.

**Fix**: Restore the specific location line or add “in Craigavon, Sandton” near the CTA. Keep `Plan A Visit` primary and `Watch Live` secondary.

**Suggested command**: `impeccable clarify src/pages/about-us/leadership.astro`

## Persona Red Flags

**Jordan, first-time visitor**: Jordan gets a much clearer page than before, but the first practical Sunday details are still sparse. If Jordan is deciding whether to visit, the page should not make them scroll to the footer for the physical location.

**Casey, distracted mobile visitor**: Casey can tap the CTAs easily, and the layout does not overflow. The problem is interruption: the cookie banner covers the leaders’ key statement right as Casey reaches it, which makes the page feel harder to read on the go.

**Riley, stress tester**: Riley finds good technical basics: no overflow, one `h1`, safe external `rel`, and working responsive buttons. The weak point is global component interaction: the consent banner collides with this page’s primary message.

**Project-specific, young Johannesburg couple exploring church**: They can see who leads the church and the heart behind it. They still need one more concrete reassurance that this community understands real family, work, and city life, not only theological aspiration.

## Minor Observations

- The increased tracking on “From our leaders” is visually distinctive, but it is close to feeling over-letterspaced on mobile.
- The photo crop is good on mobile and desktop, though the cookie banner can cover its lower edge at enlarged text.
- `Watch Live` is a reasonable secondary CTA, but `What We Believe` may be the better leadership-page companion if the goal is trust-building rather than broadcast access.
- The page’s visual palette is restrained and on-brand; no gradient text, glassmorphism, side-stripe cards, or QR clutter remain.

## Questions to Consider

- What exact sentence should a first-time visitor remember after this page?
- Should the leadership page primarily move people toward visiting, or toward understanding doctrine and trust?
- Does the “From our leaders” statement need to be a single headline, or would it become stronger as headline plus supporting line?
- Should the cookie banner ever be allowed to cover a first-run brand thesis?
