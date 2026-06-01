---
target: homepage
total_score: 23
p0_count: 0
p1_count: 2
timestamp: 2026-05-29T10-20-16Z
slug: src-pages-index-astro
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Live and cookie states exist, but the live banner appears in text extraction while not visually present in the captured top viewport; carousels and accordions do not expose strong state to assistive tech. |
| 2 | Match System / Real World | 3 | The copy is plain and pastoral, but practical visit details arrive after several large theological sections. |
| 3 | User Control and Freedom | 2 | Mobile menu and FAQ are escapable, but cookie and floating contact UI compete with the main journey; carousel auto-advances without visible pause. |
| 4 | Consistency and Standards | 2 | The page mixes manifesto hero, giant centered slogan, photo hero, card grid, map module, link list, carousel, FAQ, and final CTA with uneven component grammar. |
| 5 | Error Prevention | 2 | Low-risk page, but the directions dropdown exposes all map links in the DOM flow after measurement and could confuse screen reader order if not guarded carefully. |
| 6 | Recognition Rather Than Recall | 3 | Primary navigation is clear, but Plan Your Visit appears too late for first-timers. |
| 7 | Flexibility and Efficiency | 2 | Members can use nav for Live/Give/Visit, but the homepage itself prioritizes long reading over fast task completion. |
| 8 | Aesthetic and Minimalist Design | 2 | Strong brand voice is buried under repetition, oversized sections, decorative blur orbs, repeated red Jesus emphasis, and too many page modules. |
| 9 | Error Recovery | 2 | Few error paths on homepage; interactive states are mostly local but not fully announced. |
| 10 | Help and Documentation | 3 | FAQ helps first-time guests, but it appears very late after the user has already passed visit details and many next-step links. |
| **Total** | | **23/40** | **Acceptable: strong raw material, significant homepage hierarchy work needed.** |

## Anti-Patterns Verdict

**LLM assessment**: This does not look instantly AI-generated because the theological copy is specific and the real Sandton and kids imagery anchor the church locally. It does, however, carry several AI-template tells: repeated giant section statements, a six-card icon grid, decorative blurred background orbs, repeated uppercase kickers, and a long one-after-another landing page structure where each section competes to be the hero. The page feels authored in content but assembled in layout.

**Deterministic scan**: The bundled detector was attempted against `src/pages/index.astro` and failed with `Error: bundled detector not found.` No deterministic finding counts are available for this run.

**Visual overlays**: No reliable user-visible overlay is available. Browser screenshots and DOM measurements were used instead. Desktop and mobile captures confirmed the first practical visit CTA is below 3,900px on mobile and below 4,700px on desktop after the opening brand sections.

## Overall Impression

The homepage has a clear heart: it knows it wants people to come, see Jesus, and feel genuinely welcome. The biggest design problem is sequencing. A first-time visitor looking for time, location, and confidence has to pass through a long manifesto, a second slogan hero, and a third image-backed vision hero before the page gives them the concrete visit answer.

## What's Working

1. The brand voice is unusually specific. "Embracer of the outsider, Defender of the guilty..." is not generic church-copy filler, and it gives the homepage conviction.
2. The red restraint mostly works. Red is repeatedly tied to Jesus, primary actions, live state, and emphasis, which matches the design system.
3. The practical visit module is strong once reached. It has service time, address, a map, Plan Your Visit, and directions in one coherent area.

## Priority Issues

**[P1] The homepage delays the visitor's primary task**

Why it matters: The product context says first visits should be easy and service time, location, directions, and expectations should be findable within seconds. On mobile, the first visit details begin around 3,393px down the page. That is too late for Jordan, the first-time guest.

Fix: Recompose the first viewport around a dual-purpose invitation: the brand statement plus immediate Sunday/time/location/action. Keep one theological line, not three stacked hero sections. Put "Sundays 9:00-11:00, Craigavon AH, Sandton" and `Plan Your Visit` / `Get Directions` in the first screen.

Suggested command: `impeccable shape homepage`

**[P1] Three hero-scale sections fight each other**

Why it matters: The first 2,400px of desktop page contains "We open wide...", "Come See Jesus", and "Every time we meet..." all at hero volume. When everything is the headline, nothing becomes the page's remembered message.

Fix: Choose one opening thesis. Treat "Come. See. Jesus." as the brand lockup or section cadence, not another full hero immediately after the manifesto. Move the Sandton image into the first viewport or use it as a place-setting band after the visit CTA.

Suggested command: `impeccable distill homepage`

**[P2] The page leans on repeated landing-page grammar**

Why it matters: Six icon cards, repeated uppercase kickers, centered mega-type, rounded panels, and decorative blur blobs create a familiar generated-landing-page rhythm. The church's actual specificity gets diluted by generic section mechanics.

Fix: Replace the six equal cards with a more editorial "What happens on Sunday" flow: worship, teaching, communion, community, generosity, sending. Use fewer icons, stronger hierarchy, and real imagery where possible. Remove the decorative blur orbs from the expectations section.

Suggested command: `impeccable layout homepage`

**[P2] Cookie and floating contact UI block the emotional opening**

Why it matters: On desktop the cookie banner covers the bottom of the opening statement; on mobile it covers the "Come See Jesus" transition and competes with the floating contact button. The highest-emotion moment is visually interrupted by consent and chat chrome.

Fix: Make the cookie banner slimmer on mobile, reduce vertical copy, and consider a bottom sheet that does not occupy a third of the viewport. Keep the contact action, but ensure it does not stack visually on top of cookie controls.

Suggested command: `impeccable adapt homepage`

**[P3] Interactive components need stronger accessibility semantics**

Why it matters: The kids carousel auto-advances with ten dot buttons and no visible pause. The FAQ uses buttons but does not set `aria-expanded`. The directions dropdown needs careful hidden-state handling so collapsed links are not confusing in assistive navigation.

Fix: Add `aria-expanded` and `aria-controls` to FAQ buttons, pause carousel on interaction and respect reduced motion, expose current slide state, and verify hidden dropdown links are not focusable while closed.

Suggested command: `impeccable harden homepage`

## Persona Red Flags

**Jordan, first-time visitor**: Jordan sees a strong welcome, but does not get "when, where, what should I do next" in the first 5 seconds. On mobile, Plan Your Visit appears after several full-screen sections. The FAQ is useful but too late.

**Casey, distracted mobile user**: Casey gets a large opening statement, a cookie banner, and a floating contact button before reaching practical actions. The main task requires scrolling roughly 4,000px to Plan Your Visit, which is fragile on a phone.

**Sam, accessibility-dependent user**: Sam may encounter repeated hidden nav/drawer links in the DOM, a carousel without a pause control, FAQ buttons without expanded state, and visual red emphasis that is meaningful but not always structurally meaningful.

**First-time Johannesburg visitor, "Naledi"**: Naledi wants to know whether this is local, accessible, and safe to visit. The Sandton image helps, but it arrives after a long theological opening. The address and directions eventually answer her question well.

## Minor Observations

- The homepage uses `h2` before the first `h1`; the rendered first `h1` is the third hero. That weakens document structure.
- "GET CONNECTED" shifts into all-caps utility language while the surrounding page is warmer and more pastoral.
- The "Learn More" link contains an empty SVG, so the intended arrow icon may render as blank.
- The final invitation says "Join us this Sunday" but has no nearby CTA button, which makes the closing feel unfinished.
- The kids section is visually heavy for "Coming Soon"; it may deserve a smaller reassurance module until the ministry is active.

## Questions to Consider

- What is the one thing a first-time visitor must know before they scroll?
- Should the homepage lead with the church's theological thesis, or with a concrete Sunday invitation that carries the thesis inside it?
- Which modules are homepage-critical, and which should move to Visit, Kids, About, or Next Steps pages?
