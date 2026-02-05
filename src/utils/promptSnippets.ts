export type PromptSnippet = {
  title: string;
  description: string;
  prompt: string;
  tags?: string[];
};

export const promptSnippets: Record<string, PromptSnippet> = {
  summarize: {
    title: "Summarize",
    description: "Create a clear, concise summary of the provided text.",
    prompt:
      "Summarize the following text in 3-5 concise sentences, capturing the main points, conclusions, and any action items. Text: {{TEXT}}",
    tags: ["summary", "concise", "report"],
  },

  explain_like_im_5: {
    title: "Explain like I'm five",
    description: "Explain a concept in very simple terms suitable for a young child.",
    prompt:
      "Explain the following concept as if to a 5-year-old, using simple language and a short example: {{CONCEPT}}",
    tags: ["explain", "education", "simple"],
  },

  translate: {
    title: "Translate",
    description: "Translate text to a target language while preserving tone and context.",
    prompt:
      "Translate the following text to {{LANGUAGE}}. Preserve the original tone and meaning and adapt idioms appropriately: {{TEXT}}",
    tags: ["translate", "localization"],
  },

  rewrite_tone: {
    title: "Rewrite for tone",
    description: "Rewrite text to change tone (professional, friendly, concise, etc.).",
    prompt:
      "Rewrite the following text to be {{TONE}}. Keep the original meaning and key details, but adjust word choice and sentence structure to match the tone: {{TEXT}}",
    tags: ["rewrite", "tone", "editing"],
  },

  code_generate: {
    title: "Generate code",
    description: "Implement a function or small module from a specification.",
    prompt:
      "Write a complete, production-ready implementation for the following specification. Include function signatures, TypeScript types (if applicable), and a brief usage example. Spec: {{SPEC}}",
    tags: ["code", "generate", "typescript"],
  },

  code_refactor: {
    title: "Refactor code",
    description: "Improve code structure, readability, and maintainability without changing behavior.",
    prompt:
      "Refactor the following code for readability, performance, and maintainability without changing its behavior. Suggest or apply improvements and explain changes. Code: {{CODE}}",
    tags: ["refactor", "code-review"],
  },

  write_tests: {
    title: "Write unit tests",
    description: "Generate unit tests for the provided code, using common testing frameworks.",
    prompt:
      "Write unit tests for the following functions using {{TEST_FRAMEWORK}}. Include positive and negative cases and mock external dependencies when appropriate. Code: {{CODE}}",
    tags: ["testing", "unit-tests"],
  },

  bug_fix_hint: {
    title: "Diagnose and suggest a fix",
    description: "Analyze an error or buggy behavior and propose a fix with explanation.",
    prompt:
      "Given the following description of the bug, the environment, and the relevant code snippet, diagnose the root cause and propose a minimal, safe fix with an explanation. Bug: {{BUG_DESC}} Code: {{CODE}} Environment: {{ENV}}",
    tags: ["debugging", "bug-fix"],
  },

  commit_message: {
    title: "Commit message generator",
    description: "Create a concise, conventional commit-style message from a diff or description.",
    prompt:
      "Generate a concise commit message following Conventional Commits (type(scope): summary) using this description or diff summary: {{CHANGE_DESC}} Include a short body if necessary and reference any issue IDs.",
    tags: ["git", "commit", "conventional-commits"],
  },

  pr_description: {
    title: "Pull request description",
    description: "Generate a helpful PR description that explains what changed and why, plus testing instructions.",
    prompt:
      "Write a pull request description summarizing the changes, the motivation, the impact, and step-by-step testing instructions. Mention any migration steps, backward-incompatibility, or follow-ups: {{CHANGE_DESC}}",
    tags: ["git", "pr", "review"],
  },

  seo_meta: {
    title: "SEO meta description",
    description: "Create a meta description and suggested title optimized for search.",
    prompt:
      "For the following page/content, write a short SEO-optimized title (<=60 chars) and meta description (<=155 chars) that capture the page intent and include target keywords: {{PAGE_CONTENT}} Keywords: {{KEYWORDS}}",
    tags: ["seo", "meta"],
  },
};

export default promptSnippets;

/*
Usage:
import promptSnippets from '../utils/promptSnippets';
console.log(promptSnippets.summarize.prompt.replace('{{TEXT}}', myText));
*/
