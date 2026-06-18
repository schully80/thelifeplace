---
target: about-us/leadership page new design in dev
total_score: 28
p0_count: 0
p1_count: 2
timestamp: 2026-06-18T10-13-04Z
slug: src-pages-about-us-leadership-astro
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Static page is clear and nav state is visible; no dynamic status needed. |
| 2 | Match System / Real World | 3 | Warm, plain church language, but the page title says "Jenny" while the page says "Genevieve." |
| 3 | User Control and Freedom | 3 | Navigation and links are available; primary visit path is delayed rather than unavailable. |
| 4 | Consistency and Standards | 2 | Same oversized type treatment repeats across hero, quote, and story; naming mismatch weakens trust. |
| 5 | Error Prevention | 3 | Low-risk page; external Substack link is labeled clearly. |
| 6 | Recognition Rather Than Recall | 3 | Link labels are clear, but visitors must scroll far to find the primary action. |
| 7 | Flexibility and Efficiency | 2 | Works as a linear story, but there is no fast path from hero to visit, contact, or beliefs. |
| 8 | Aesthetic and Minimalist Design | 3 | Restrained and focused, but the hierarchy is heavy-handed and repetitive. |
| 9 | Error Recovery | 3 | Not much error surface here; standard navigation gives recovery paths. |
| 10 | Help and Documentation | 3 | Footer and nav are useful; page itself could answer more first-visit trust questions. |
| **Total** | | **28/40** | **Good: strong foundation, important hierarchy and trust fixes needed.** |

#### Anti-Patterns Verdict

**LLM assessment**: This does not immediately read as AI-generated. Real photography, restrained red usage, and clear Jesus-centered copy keep it grounded. The AI-slop risk is subtler: the page leans on a now-common brand-page formula of large grayscale photo, massive sans heading, giant pull quote, short story block, red CTA. It is polished, but not yet specific enough to Schulter and Genevieve as people or to The Life Place as a local church.

**Deterministic scan**: The detector could not run. `detect.mjs` exists, but it reported `Error: bundled detector not found.` No deterministic source findings are available.

**Visual overlays**: No reliable user-visible overlay is available. Browser mutation succeeded, but the Impeccable live overlay helper timed out and the injected `detect.js` request failed with `ERR_CONNECTION_REFUSED`.

#### Overall Impression

The design is calm, readable, and on-brand, but it is too much of a beautiful poster and not enough of a trust-building leadership page. The biggest opportunity is to move a concrete visitor path and a few specific credibility details higher, while reducing the repeated "everything is huge and black" rhythm.

#### What's Working

- The opening image is real and human. It immediately gives visitors faces, not abstract ministry branding.
- The page has a clean four-part narrative: leaders, quote, story, Sunday invitation. That is easy to scan.
- The final CTA is clear and visually memorable. The red is reserved for a genuine invitation moment, which matches the design system.

#### Priority Issues

**[P1] The primary action is buried below the story**

**Why it matters**: On mobile, `Plan A Visit` appears around 2842px down the page. A first-time visitor who came from About or search may understand who the leaders are, but still has no immediate path to visit, directions, or service context in the first few screens.

**Fix**: Add a small action row or visitor detail block in the hero: `Plan A Visit`, `Watch Live`, and a compact Sunday/location line. Keep it quieter than the homepage hero, but make the next step visible before the quote.

**Suggested command**: `impeccable layout`

**[P1] The leadership story is too generic for a trust page**

**Why it matters**: The page says "founding pastors," "parents," "friends," and "writers," but gives very little concrete texture. Visitors evaluating a church want to know who these leaders are, what they lead, how they care for people, and why their story matters.

**Fix**: Add a more specific section or compact fact row: founding role, pastoral focus, teaching/care responsibilities, writing link, family/community note, and a direct connection to the church's invitation. Attribute the quote or turn it into a signed note.

**Suggested command**: `impeccable clarify`

**[P2] The visual hierarchy repeats the same move too often**

**Why it matters**: The H1, pull quote, story headline, and CTA headline are all heavy Montserrat at large scale. Individually they work; together they flatten the page because every section shouts with the same voice.

**Fix**: Let the hero own the largest type. Make the quote more editorial through measure, indentation, attribution, or a quieter weight. Make the story headline smaller or split it with supporting metadata.

**Suggested command**: `impeccable typeset`

**[P2] The hero image crop and ordering weaken the mobile first impression**

**Why it matters**: Mobile opens with a large photo, then label and names, but no action or practical context. The image crop is friendly, but it consumes the first screen before the page tells the visitor what they can do.

**Fix**: Reduce mobile image height slightly, test `object-position`, and bring at least one action or Sunday cue into the hero content. Keep the photo, but make the first viewport feel like a page with purpose, not only a portrait.

**Suggested command**: `impeccable adapt`

**[P2] Naming inconsistency creates a small trust crack**

**Why it matters**: The metadata says `Schulter & Jenny`, while the H1 and alt text say `Schulter and Genevieve Etyang`. For a leadership page, names are identity and trust, not a minor detail.

**Fix**: Decide whether public naming is `Jenny` or `Genevieve`, then align title, description, H1, alt text, and internal links.

**Suggested command**: `impeccable harden`

#### Persona Red Flags

**Jordan (First-Timer)**: Jordan gets faces and names quickly, but not the practical next step. There is no hero-level `Plan A Visit`, service time, or "what to do next" cue. The Substack button appears before the visit CTA, which can pull a newcomer away from the church path.

**Casey (Distracted Mobile User)**: Casey has to scroll through the photo, intro, pull quote, and story before reaching `Plan A Visit`. The cookie banner then competes with the final CTA area near the bottom, making the visit path feel late and interruptible.

**Sam (Accessibility-Dependent User)**: The main links have focus states and the image alt text is meaningful, which is good. The risk is readability and orientation: very large text blocks create long vertical journeys, and the final CTA's uppercase, letter-spaced address is harder to parse than a normal service detail line.

**Project-specific: Young urban couple evaluating Sunday**: They need confidence quickly: who leads this church, what kind of welcome will we receive, and how do we visit? The current page gives warmth, but delays practical reassurance and does not connect the leaders' pastoral care to the first visit experience until the final CTA.

#### Minor Observations

- The final CTA only shows the first address line, `51 Villa Monte Catini`, not the fuller Craigavon/Sandton context.
- The desktop cookie banner overlays the pull quote area in the captured view. That is global, but it affects this page's strongest brand moment.
- `Read Schulter's Substack` is useful, but centering it inside the story column makes it feel like the page's main action for a while.
- The page's source has a few whitespace/copy polish issues around the intro and story paragraphs.

#### Questions to Consider

- Should a visitor be able to plan a visit from the leadership hero, or should this page remain primarily biographical?
- What would a more confident version say that only Schulter and Genevieve could say?
- Is the page meant to build trust in leaders, route people to Sunday, or send readers to Schulter's writing? Right now it does all three, but not in a clear order.
