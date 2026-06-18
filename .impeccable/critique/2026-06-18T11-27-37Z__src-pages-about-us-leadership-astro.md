---
target: about-us/leadership page final design in dev
total_score: 32
p0_count: 0
p1_count: 0
timestamp: 2026-06-18T11-27-37Z
slug: src-pages-about-us-leadership-astro
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Static page state is clear; active nav and link destinations are visible. |
| 2 | Match System / Real World | 4 | Language is warm, plain, and aligned with the church's invitation. |
| 3 | User Control and Freedom | 3 | Users can choose visit, live, or Substack without getting trapped. |
| 4 | Consistency and Standards | 3 | Naming, CTA labels, and brand patterns are now consistent; small spacing/overlay issues remain. |
| 5 | Error Prevention | 3 | Low-risk page; external Substack link is properly labeled as opening a new tab. |
| 6 | Recognition Rather Than Recall | 3 | Service time, place, and actions are visible, but the compact mobile CTA still lands below the first viewport. |
| 7 | Flexibility and Efficiency | 3 | Multiple practical paths exist without clutter: visit, live, writing. |
| 8 | Aesthetic and Minimalist Design | 3 | Strongly simplified; the hero service card is the only area still carrying a lot of density. |
| 9 | Error Recovery | 3 | Standard navigation and footer give fallback paths; no meaningful error surface. |
| 10 | Help and Documentation | 4 | The page gives enough context for visitors and points to deeper writing without over-explaining. |
| **Total** | | **32/40** | **Good: close to ship; remaining work is focused polish.** |

#### Anti-Patterns Verdict

**LLM assessment**: This no longer reads as obvious AI output. The earlier repeated CTA pattern and generic trust cards have been stripped out, which makes the page feel more authored. The page now has a clear sequence: leaders, leadership conviction, story, invitation. The remaining AI-slop risk is not the composition itself, but the tendency toward very large Montserrat blocks in every section. It is controlled enough to ship, but one more typographic contrast move would make it feel more bespoke.

**Deterministic scan**: The CLI detector could not run. `detect.mjs` exists, but it failed with `Error: bundled detector not found.` No deterministic source findings were produced.

**Visual overlays**: No reliable user-visible overlay is available. Browser mutation succeeded, but the Impeccable live overlay helper timed out and injected `detect.js` failed with `ERR_CONNECTION_REFUSED`.

#### Overall Impression

This is a substantially cleaner leadership page than the previous pass. The design now respects the page's job: create trust in the leaders, keep Jesus central, and provide one practical visitor path without repeating CTAs everywhere. The biggest remaining opportunity is compact mobile: the hero is strong, but the primary action starts below the first viewport on a 390x844 screen.

#### What's Working

- The page has a clear emotional arc. It begins with real faces, moves to a leadership conviction, gives a short story, and ends with an invitation.
- The CTA duplication is solved. There is one practical hero CTA cluster and one red invitation section without competing buttons.
- The story section is calmer and more focused. Removing the three cards made the page feel less like a template and more like a leadership note.

#### Priority Issues

**[P2] Compact mobile still hides the first action below the fold**

**Why it matters**: On a 390x844 viewport, `Plan A Visit` starts around 941px, below the first screen. The visitor sees the photo, name, intro, service details, and part of the card before reaching the action.

**Fix**: Tighten the mobile hero card only: reduce icon tile size, make the time/place blocks more compact, or place the buttons immediately after the `Join us this Sunday` label with details below. Keep desktop as-is.

**Suggested command**: `impeccable adapt`

**[P2] Cookie consent competes with the red invitation section**

**Why it matters**: On mobile, the cookie banner sits directly over the transition around the red invitation and footer. This is global, but it weakens the final emotional beat of this page.

**Fix**: Either make the cookie banner more compact on mobile or ensure bottom page sections have enough safe area when the banner is visible.

**Suggested command**: `impeccable polish`

**[P3] The page still relies heavily on one typographic move**

**Why it matters**: The hero, quote, story heading, and red invitation are all heavy Montserrat. It is on-brand, but a little monotonous.

**Fix**: Leave the hero and red invitation bold, then make the leader quote feel slightly more quoted: smaller max width, lighter supporting attribution, or slightly calmer scale.

**Suggested command**: `impeccable typeset`

**[P3] The hero place block omits the secondary street detail**

**Why it matters**: The hero says `51 Villa Monte Catini` and `Craigavon AH, Sandton`, while the footer has the fuller address. It is probably enough for scanning, but a visitor who wants precise details must click through.

**Fix**: If the hero is meant to be sufficient, add `1 Elm Avenue` in the place block. If it is meant only as a prompt, leave it and rely on `Plan A Visit`.

**Suggested command**: `impeccable clarify`

#### Persona Red Flags

**Jordan (First-Timer)**: Jordan understands who the leaders are and sees service details in the hero. The only friction is that on compact mobile the visible service card asks them to keep scrolling before reaching `Plan A Visit`.

**Casey (Distracted Mobile User)**: Casey gets a warm page, large touch targets, and clear labels. The first action is slightly too low, and the cookie banner later occupies a lot of bottom-screen attention.

**Sam (Accessibility-Dependent User)**: Links have text labels and focus styles, images have useful alt text, and icon meaning is repeated in text. The layout is mostly linear and should read cleanly to assistive tech.

**Project-specific: Young urban couple evaluating Sunday**: They get faces, tone, time, place, and a clear next step. The page now supports trust. The remaining question is whether the hero should prioritize immediate visiting even more aggressively on mobile.

#### Minor Observations

- Desktop screenshot shows the cookie banner overlapping the lower edge of the hero card area. It is not fatal, but it visually crowds the first action.
- `Read Schulter's Substack` is well placed as a secondary action. It no longer competes with Sunday visit CTAs.
- The red invitation section works better without buttons. It now feels like a close, not another conversion block.
- The mobile page is dense but coherent; no meaningful horizontal overflow was detected.

#### Questions to Consider

- Should the compact mobile hero prioritize `Plan A Visit` above service details, or are the service details more important before the click?
- Does the red invitation section need a small text link to visit, or is keeping it CTA-free the right restraint?
- Is the large leadership quote meant to feel like a spoken note, or like a manifesto? That answer should drive the final typography.
