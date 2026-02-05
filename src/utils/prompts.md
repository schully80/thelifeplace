# Prompt snippets

This file documents the reusable prompt snippets available in `src/utils/promptSnippets.ts` and quick usage notes.

## Quick usage

- Programmatically:
  ```js
  import promptSnippets from '../utils/promptSnippets';
  const text = promptSnippets.safe_edit.prompt;
  ```

- UI (no code):
  1. Render `<PromptSnippetBrowser />` on a page or layout.
  2. Focus any textarea / input / contentEditable where you want the prompt.
  3. Click Insert on a snippet — it will auto-insert at the caret, copy to clipboard, and dispatch a global event `promptSnippetInsert`.

## Available snippets (keys)

- `summarize` — Summarize text concisely.
- `explain_like_im_5` — Explain a concept simply.
- `translate` — Translate text to a target language.
- `rewrite_tone` — Rewrite text to a specified tone.
- `code_generate` — Generate production-ready code from a spec.
- `code_refactor` — Refactor code for readability and performance.
- `write_tests` — Generate unit tests for given code.
- `bug_fix_hint` — Diagnose and suggest a fix for bugs.
- `commit_message` — Generate Conventional Commit messages.
- `pr_description` — Produce helpful PR descriptions.
- `seo_meta` — Create SEO-optimized title/meta.
- `safe_edit` — Minimal Change (Safe Edit).
- `explain_new` — Explain code and exact edit instructions.
- `predeploy_uiux` — Pre-deploy UI/UX proof (no redesign).
- `multi_device_parity` — Verify parity across breakpoints.
- `typography_spacing` — Typography + spacing standards.
- `match_system` — Match site design system.
- `clean_refactor` — Clean refactor without behavior changes.
- `shipcheck` — Quick pre-deploy checklist.

## Event hook

Listen for insert events:

```js
window.addEventListener('promptSnippetInsert', (e) => {
  // e.detail: { key, prompt, autoInserted }
});
```

---
File maintained by the project; edit `src/utils/promptSnippets.ts` to add or update snippets.
