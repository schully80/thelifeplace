/**
 * 🔒 Input Validation & Sanitization Utility
 * Prevents XSS, injection attacks, and data validation errors
 */

// ✅ Sanitize HTML special characters
export function sanitizeHTML(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return input.replace(/[&<>"']/g, char => map[char]);
}

// ✅ Validate email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// ✅ Validate phone number
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

// ✅ Validate CSRF token format (UUID without hyphens)
export function validateCSRFToken(token: string): boolean {
  return /^[a-f0-9]{32}$/.test(token);
}

// ✅ Validate donation amount
export function validateAmount(amount: number | string): boolean {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0 && num <= 999999.99; // Max R999,999.99
}

// ✅ Validate ZA phone number specifically
export function validateZAPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return (cleaned.startsWith("27") && cleaned.length === 11) || 
         (cleaned.startsWith("0") && cleaned.length === 10);
}

// ✅ Validate ZA postal code
export function validateZAPostalCode(code: string): boolean {
  return /^\d{4}$/.test(code);
}

// ✅ Sanitize name input (alphanumeric, spaces, hyphens only)
export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z\s\-']/g, "")
    .substring(0, 100);
}

// ✅ Sanitize message text (allow common punctuation)
export function sanitizeMessage(message: string): string {
  return sanitizeHTML(
    message
      .trim()
      .substring(0, 5000) // Max 5000 chars
  );
}

// ✅ Validate URL (prevent javascript: and data: protocols)
export function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// ✅ Validate form data object
export interface FormValidationRules {
  [key: string]: (value: any) => boolean;
}

export function validateForm(data: Record<string, any>, rules: FormValidationRules): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [field, validator] of Object.entries(rules)) {
    if (!validator(data[field])) {
      errors[field] = `Invalid ${field}`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ✅ Validate JSON input
export function validateJSON(input: string): { valid: boolean; data?: any; error?: string } {
  try {
    const data = JSON.parse(input);
    return { valid: true, data };
  } catch (e) {
    return { valid: false, error: "Invalid JSON" };
  }
}
