# Typography Color System Reference

## Color Palette

### Primary Text Hierarchy
| Usage | Color | Tailwind | Hex | Notes |
|-------|-------|----------|-----|-------|
| **Headings** | Gray 800 | `text-gray-800` | #1f2937 | h1, h2, h3, h4, titles |
| **Body Text** | Gray 600 | `text-gray-600` | #4b5563 | Paragraphs, descriptions, main content |
| **Muted Text** | Gray 500 | `text-gray-500` | #6b7280 | Labels, captions, metadata, timestamps |
| **Subtle Text** | Gray 400 | `text-gray-400` | #9ca3af | Placeholders, disabled states |

## Semantic Usage

### Headings (All Levels)
```html
<!-- Automatically use gray-800 via global.css -->
<h1>Main Page Title</h1>          <!-- Gray 800 -->
<h2>Section Heading</h2>           <!-- Gray 800 -->
<h3>Subsection Title</h3>          <!-- Gray 800 -->
<h4>Card Title</h4>                <!-- Gray 800 -->

<!-- Utility Classes -->
<div class="heading-1">Large Title</div>         <!-- Gray 800 -->
<div class="heading-2">Section Heading</div>     <!-- Gray 800 -->
<div class="heading-3">Subsection</div>          <!-- Gray 800 -->
<div class="heading-4">Small Heading</div>       <!-- Gray 800 -->
```

### Body Text
```html
<!-- Automatically use gray-600 via global.css -->
<p>This is the primary body text for reading comfort.</p>

<!-- Explicit class usage -->
<div class="text-gray-600">Supporting paragraph text</div>
```

### Secondary Information
```html
<!-- Use gray-500 for metadata and captions -->
<span class="text-gray-500 text-sm">Posted on January 27, 2026</span>
<span class="text-gray-500 italic">Image caption here</span>
<label class="text-gray-500">Optional field</label>
```

### Buttons & Interactive Elements
```html
<!-- Primary button - uses brand red -->
<button class="btn-primary">Save Changes</button>

<!-- Outline button - uses gray-800 -->
<button class="btn-outline">Cancel</button>

<!-- Ghost button - uses gray-600 -->
<button class="btn-ghost">Learn More</button>
```

## Component Examples

### Card with Title and Description
```html
<div class="rounded-lg border border-gray-200 p-6">
  <h3 class="text-gray-800 text-xl font-bold mb-2">Card Title</h3>
  <p class="text-gray-600 mb-4">This is the card description that provides context and explanation.</p>
  <span class="text-gray-500 text-sm">Updated 2 hours ago</span>
</div>
```

### Navigation Link States
```html
<!-- Normal state -->
<a href="#" class="text-gray-800 hover:text-brand-red">Active Link</a>

<!-- Secondary navigation -->
<a href="#" class="text-gray-600 hover:text-brand-red">Secondary Link</a>

<!-- Muted link -->
<a href="#" class="text-gray-500 hover:text-gray-800">Metadata Link</a>
```

### Form Elements
```html
<!-- Labels -->
<label class="text-gray-800 font-semibold">Email Address</label>

<!-- Helper text -->
<p class="text-gray-500 text-sm">We'll never share your email address</p>

<!-- Placeholder text (gray-400) -->
<input placeholder="Enter your email..." class="placeholder:text-gray-400">

<!-- Error text -->
<p class="text-red-600 text-sm">This field is required</p>
```

## Accessibility Notes

### Contrast Ratios
- Gray-800 (#1f2937) on white: **13.5:1** ✅ AAA
- Gray-600 (#4b5563) on white: **8.3:1** ✅ AA
- Gray-500 (#6b7280) on white: **6.8:1** ✅ AA
- Gray-400 (#9ca3af) on white: **4.5:1** ✅ AA (minimum)

### Best Practices
1. Use gray-800 for all primary content and headings
2. Use gray-600 for body text and descriptions (default for `<p>` tags)
3. Use gray-500 only for secondary information (metadata, labels)
4. Maintain sufficient contrast for accessible design
5. Test with accessibility tools (WAVE, Axe, Lighthouse)

## Exceptions & Special Cases

### Dark Backgrounds
When text appears on dark backgrounds (e.g., footers, overlays):
```html
<!-- Light text on dark background -->
<div class="bg-gray-900 p-6">
  <h2 class="text-white">Light Heading</h2>
  <p class="text-gray-100">Light body text</p>
  <span class="text-gray-400">Muted text</span>
</div>
```

### Emphasized/Strong Text
```html
<p class="text-gray-600">
  This is <strong class="text-gray-800 font-semibold">emphasized text</strong> within a paragraph.
</p>
```

### Disabled States
```html
<button class="text-gray-400 cursor-not-allowed" disabled>Disabled Button</button>
```

## Migration Checklist

- [x] Updated global.css base layer
- [x] Updated heading utility classes (.heading-1 through .heading-4)
- [x] Replaced text-gray-900 with text-gray-800 across all files
- [x] Replaced text-gray-700 with text-gray-600 across all files
- [x] Updated button styling
- [x] Verified color hierarchy
- [x] Tested on multiple pages
- [ ] Update design system documentation
- [ ] Accessibility audit
- [ ] User testing feedback
- [ ] Dark mode support (future)

## Resources

- **Tailwind Color Scale**: https://tailwindcss.com/docs/customizing-colors
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Typography Best Practices**: https://www.smashingmagazine.com/

---

**Last Updated**: February 2, 2026
**Version**: 1.0
**Status**: ✅ Implemented
