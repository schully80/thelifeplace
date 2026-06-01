---
name: The Life Place
description: A warm, Jesus-centered church website for visits, messages, giving, prayer, and next steps.
slogan: "Come. See. Jesus."
vision_statement: "Every time we meet, we see how true, good, beautiful, and kind Jesus is."
target_audience:
  - Young urban couples
  - Couples with young children
  - Urban professionals
  - First-time visitors in Johannesburg and Sandton
colors:
  brand-red: "#B3282D"
  brand-red-hover: "#9F2429"
  brand-red-deep: "#8F1F24"
  brand-red-soft: "#FDECEC"
  page-white: "#FFFFFF"
  soft-panel: "#F9FAFB"
  warm-gray-50: "#F7F7F7"
  warm-gray-200: "#E3E4E3"
  warm-gray-500: "#B0B2B1"
  warm-gray-700: "#6E706F"
  ink-heading: "#1F2937"
  ink-body: "#4B5563"
  ink-muted: "#6B7280"
  ink-subtle: "#9CA3AF"
  ink-black: "#171717"
typography:
  display:
    fontFamily: "Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "clamp(3rem, 8vw, 6rem)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.75
  label:
    fontFamily: "Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.16em"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  "2xl": "1.5rem"
  "3xl": "1.875rem"
  pill: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  "2xl": "3rem"
  section-sm: "4rem"
  section-md: "6rem"
  section-lg: "8rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-red}"
    textColor: "{colors.page-white}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0.75rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.brand-red-hover}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.lg}"
    padding: "0.75rem 1.25rem"
  button-outline:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink-heading}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0.75rem 1.25rem"
  card:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink-heading}"
    rounded: "{rounded.2xl}"
    padding: "1.5rem"
  input:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink-heading}"
    rounded: "{rounded.lg}"
    padding: "14px 12px"
---

# Design System: The Life Place

## 1. Overview

**Creative North Star: "The Open Door Sanctuary"**

The Life Place uses a restrained, welcoming brand system built from white space, soft grays, local photography, and one unmistakable red. The visual language should feel like a clear invitation: warm, direct, practical, and centered on the repeated phrase "Come. See. Jesus."

The core vision statement is: "Every time we meet, we see how true, good, beautiful, and kind Jesus is." Treat this as a primary brand artifact. It can anchor hero sections, about-page storytelling, and major invitation moments. Preserve the wording exactly when used as the vision statement.

The target audience is young, urban, and practically minded: couples, couples with young children, and professionals in Johannesburg and Sandton. The site should feel current, local, and easy to understand without assuming deep church background.

The system is a brand website, but it should not become a generic church template. Big Montserrat headlines carry conviction, red highlights mark the Jesus-centered message, and photography grounds the site in a real place and community. UI surfaces stay simple enough for visitors to find service times, directions, messages, prayer, and giving without friction.

**Key Characteristics:**
- White and light gray surfaces with brand red used sparingly and deliberately.
- Heavy Montserrat type, especially in hero statements and navigation.
- Rounded cards, buttons, drawers, and fields that feel approachable rather than formal.
- Local imagery, grayscale treatments, and dark overlays when text sits on photography.
- Motion that reveals and responds, never distracts from the invitation.

## 2. Colors

The palette is a restrained white and gray system with one warm red accent carrying brand recognition and theological emphasis.

### Primary
- **Church Door Red**: The primary accent for calls to action, active navigation, key words like Jesus, validation states, live indicators, QR codes, and selected links.
- **Deep Door Red**: The hover and deeper state for primary actions, especially buttons and links that need stronger affordance.
- **Soft Welcome Red**: A pale red tint for selected states, soft alerts, live-banner glow, and red-accented surface hints.

### Neutral
- **Page White**: The main canvas. Use it for body backgrounds, navigation, cards, dropdowns, and forms.
- **Soft Panel Gray**: The quiet panel color for form blocks, cards, code previews, and subtle content grouping.
- **Warm Gray Scale**: The brand-specific gray family for quiet dividers, backgrounds, and secondary content.
- **Heading Ink**: Primary heading and title color.
- **Body Ink**: Paragraph and supporting copy color.
- **Muted Ink**: Metadata, labels, helper text, footer copy, and secondary information.
- **Subtle Ink**: Placeholder text, disabled affordances, and quiet UI annotations.
- **Near Black**: Icon buttons, social buttons, and high-contrast navigation icons when red would be too loud.

### Named Rules

**The Red Is Reserved Rule.** Brand red is not decoration. Use it for Jesus emphasis, primary action, active state, validation, live state, or an explicitly important link.

**The Slogan And Vision Rule.** "Come. See. Jesus." is the recurring invitation. "Every time we meet, we see how true, good, beautiful, and kind Jesus is." is the recurring vision statement. Use them as designed copy moments with enough space and hierarchy to feel intentional. Do not bury them in generic paragraphs or alter their wording.

**The Modern Language Rule.** Write for young urban couples, young families, and professionals. Prefer "see" over heavier church words such as "behold." Avoid heavy church lingo unless the surface is explicitly teaching doctrine or explaining beliefs; when theological terms are necessary, pair them with plain-language explanation.

**The White Canvas Rule.** Default surfaces stay white or near-white. Gray panels should organize content; they should not make the site feel boxed in.

## 3. Typography

**Display Font:** Montserrat, with system sans fallbacks.
**Body Font:** Montserrat, with system sans fallbacks.
**Label/Mono Font:** No distinct mono family is part of the visual system.

**Character:** The type system is a single-family, high-confidence voice. Large pages use very heavy weights and tight tracking for conviction; body copy stays medium weight with generous line height for readability.

### Hierarchy
- **Display** (900, clamp from 3rem to 6rem, 1.05 line-height): Hero statements, large Jesus-centered invitations, and first-screen brand messages.
- **Headline** (900, clamp from 2.25rem to 4.5rem, 1.15 line-height): Section headings, major page titles, and feature introductions.
- **Title** (800, 1.875rem, 1.25 line-height): Card groups, form titles, dropdown groups, and secondary page headings.
- **Body** (500, 1rem, 1.75 line-height): Paragraphs, descriptions, footer content, forms, and supporting copy. Keep long prose near 65 to 75 characters.
- **Label** (600, 0.875rem, 0.16em letter-spacing, uppercase when used): Preheaders, metadata, admin labels, and compact state labels.

### Named Rules

**The Heavy Means Important Rule.** Use 900 weight only for major invitation, navigation, or page structure. Do not make every card title black and enormous.

**The No Decorative Mono Rule.** Do not introduce monospace labels for style. This brand is warm and pastoral, not technical.

## 4. Elevation

Depth is a hybrid system: most surfaces are flat, but cards, dropdowns, drawers, floating contact actions, and media previews use soft shadows to show interactivity. Shadows should be diffuse, low contrast, and paired with rounded corners. Tonal layering carries default structure; elevation appears when an element is floating, hovered, or opened.

### Shadow Vocabulary
- **Soft Card** (`box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05)`): Resting cards, media thumbnails, and compact badges.
- **Raised Card** (`box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10)`): Hovered cards, dropdowns, and forms that need clear separation.
- **Floating Contact** (`box-shadow: 0 10px 32px rgba(0, 0, 0, 0.18), 0 8px 24px rgba(0, 0, 0, 0.12)`): Fixed contact bubble and highly prominent floating UI.
- **Red Glow** (`box-shadow: 0 10px 30px rgba(179, 40, 45, 0.18)`): Live banner and primary red affordances when extra attention is warranted.

### Named Rules

**The Flat First Rule.** A surface starts flat. Add shadow only for hover, open menus, media containers, floating actions, or form blocks.

**The No Hard Shadow Rule.** If the shadow looks black, sharp, or like a 2014 app, it is too strong.

## 5. Components

### Buttons
- **Shape:** Softly rounded by default (0.5rem to 1rem), with pill shapes reserved for compact chips, social buttons, and special floating actions.
- **Primary:** Church Door Red background with white text, medium or bold Montserrat, and `0.75rem 1.25rem` to `1rem 2rem` padding depending on page prominence.
- **Hover / Focus:** Darken to Deep Door Red or strengthen border opacity. Use focus rings with red at roughly 70% opacity and visible offset.
- **Outline:** White background with Heading Ink text and a gray or red border. Hover may invert to dark gray or move to a pale gray background.
- **Large CTA:** On marketing sections, CTAs may use `rounded-2xl`, heavier weight, and soft shadow. Keep the label direct and action-oriented.

### Chips
- **Style:** Rounded pills with subtle red or gray tints, compact text, and red active states.
- **State:** Selected and live states use red fill or red text. Neutral chips should stay quiet and avoid saturated backgrounds.

### Cards / Containers
- **Corner Style:** Most content cards use `rounded-2xl`; featured media can use `rounded-3xl`.
- **Background:** White for media and primary cards; `#F9FAFB` or warm gray for quiet expectation cards and form groupings.
- **Shadow Strategy:** Resting cards use soft shadows or borders; hover cards may lift to Raised Card and change border to red at low opacity.
- **Border:** Use light gray borders, usually `#E5E7EB` or black at 5 to 10% opacity.
- **Internal Padding:** Standard card padding is 1.5rem; large feature cards use 2rem to 2.5rem on desktop.
- **Standard Content Card Interaction:** Use the homepage "What happens on Sunday" pattern for icon-led content cards across the project: white card, `rounded-2xl`, gray border, `shadow-sm`, `transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out`, `hover:border-brand-red/30`, `hover:bg-gray-50`, `hover:shadow-md`, and `active:scale-[0.99]`. Do not invent stronger lift, color inversion, or unrelated hover treatments for equivalent cards.

### Icons
- **Library:** Use Font Awesome classes already loaded by the base layout for Astro content cards and static page icons. Use full icon class strings in data, for example `fa-solid fa-book-open`, so icon usage is portable and consistent.
- **Standard Icon Tile:** For content cards, use an 11x11 icon tile with `rounded-2xl bg-[#FDECEC] text-brand-red`. Keep the icon itself simple and decorative with `aria-hidden="true"` unless it is the only label for an action.
- **Meaning:** Pick recognizable icons that support the card title. Avoid changing icon color on hover unless the component has a documented project-wide variant.

### Inputs / Fields
- **Style:** Floating-label fields with white translucent backgrounds, 1.5px gray borders, 0.75rem radius, and 14px vertical padding.
- **Focus:** Keep border calm and add a soft gray focus halo. Valid and error states use brand red consistently.
- **Error / Disabled:** Errors use brand red text and a pale red field background. Disabled states use Subtle Ink and reduced opacity.

### Navigation
- **Style:** Header uses white with slight transparency, a bottom border, and optional backdrop blur. Desktop navigation is oversized, black-weight Montserrat with tight negative tracking.
- **Default / Hover / Active:** Default links are gray. Hover deepens the gray and may animate a 2px red underline. Active links and key actions use brand red.
- **Mobile / Tablet:** Drawers are white, full-width or near-full-width, with large heavy menu labels and left-to-right reveal motion. Accordions expand with grid-row transitions.

### Media Cards
- **Style:** Images are rounded, cropped with `object-cover`, and often grayscale or darkened when text overlays them.
- **Hover:** Scale image media to 105% over 300 to 500ms. Keep the container clipped and rounded so the effect feels contained.

### Floating Contact
- **Style:** A fixed red chat bubble with asymmetric rounding (`28px 4px 28px 28px`) and a substantial soft shadow.
- **Interaction:** Hover lifts, rotates slightly, brightens, and scales. Active state compresses to show press feedback.

## 6. Do's and Don'ts

### Do:
- **Do** use Church Door Red for primary calls to action, live indicators, active navigation, and the word Jesus when it is intentionally emphasized.
- **Do** keep the default page canvas white with Heading Ink for headings and Body Ink for paragraphs.
- **Do** use Montserrat consistently across display, navigation, labels, forms, and body copy.
- **Do** pair large Jesus-centered statements with generous vertical spacing and restrained supporting copy.
- **Do** use real local imagery and photo-backed sections when a page needs place, people, worship, ministries, or visit context.
- **Do** use soft rounded forms and cards, especially `rounded-xl`, `rounded-2xl`, and `rounded-3xl`.
- **Do** include hover, focus, active, disabled, valid, and error states for interactive components.

### Don't:
- **Don't** use red as a background wash across ordinary sections. Its rarity is what gives it meaning.
- **Don't** introduce purple gradients, neon accents, glass cards, or generic SaaS landing-page effects.
- **Don't** use gradient text for headings. Existing gradient-text instances should be treated as exceptions to remove during polish.
- **Don't** use side-stripe borders thicker than 1px as decorative accents. Existing left borders should remain functional information markers only.
- **Don't** replace photography with abstract color blocks where visitors need to understand the real place or community.
- **Don't** add a second display font, decorative serif, or monospace styling unless the full brand direction is intentionally changed.
- **Don't** make every surface a card. Use full-width white sections and simple layout first.
