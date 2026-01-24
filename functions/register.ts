import { validateEmail, validatePhone, sanitizeName, sanitizeMessage, validateCSRFToken as validateCSRFFormat } from '../src/utils/validation';
import { logFormSubmission, logSecurityEvent } from '../src/utils/secure-logging';
import { getClientIP } from '../src/utils/api-auth';

export const onRequestPost: PagesFunction = async (context) => {
  const { request, env } = context;
  const ip = getClientIP(request.headers);

  try {
    const formData = await request.formData();

    // ✅ CSRF Token validation
    const csrfToken = (formData.get("csrf_token") || "").toString().trim();
    if (!csrfToken || !validateCSRFFormat(csrfToken)) {
      logSecurityEvent("Invalid/missing CSRF token on registration", "high", { endpoint: "/register" }, ip);
      const errUrl = new URL("/register-error/?reason=csrf", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    // 🐜 Honeypot check
    const website = (formData.get("website") || "").toString().trim();
    if (website) {
      // Likely a bot – pretend success but discard
      logSecurityEvent("Honeypot triggered on registration form", "low", { endpoint: "/register" }, ip);
      const url = new URL("/thank-you/?event=Registration", request.url);
      return Response.redirect(url.toString(), 303);
    }

    // ✅ Input validation & sanitization
    const email = (formData.get("email") || "").toString().trim();
    const firstName = sanitizeName((formData.get("firstName") || "").toString());
    const lastName = sanitizeName((formData.get("lastName") || "").toString());
    const phone = (formData.get("phone") || "").toString().trim();
    const message = sanitizeMessage((formData.get("message") || "").toString());

    // Validate required fields
    if (!email || !firstName || !lastName) {
      logFormSubmission("registration", { status: "missing_fields" }, ip);
      const errUrl = new URL("/register-error/?reason=incomplete", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    // Validate email format
    if (!validateEmail(email)) {
      logFormSubmission("registration", { status: "invalid_email" }, ip);
      const errUrl = new URL("/register-error/?reason=invalid_email", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    // Validate phone if provided
    if (phone && !validatePhone(phone)) {
      logFormSubmission("registration", { status: "invalid_phone" }, ip);
      const errUrl = new URL("/register-error/?reason=invalid_phone", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    // 🔐 reCAPTCHA verification
    const recaptchaSecret = env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecret) {
      console.error("Missing RECAPTCHA_SECRET_KEY in environment");
      logSecurityEvent("Missing reCAPTCHA secret", "high", { endpoint: "/register" }, ip);
      const errUrl = new URL("/register-error/", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    const recaptchaResponse =
      (formData.get("g-recaptcha-response") || "").toString().trim();

    if (!recaptchaResponse) {
      logSecurityEvent("Missing reCAPTCHA response on registration", "medium", { endpoint: "/register" }, ip);
      const errUrl = new URL("/register-error/", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    const verifyBody = new URLSearchParams({
      secret: recaptchaSecret,
      response: recaptchaResponse,
    });

    const verifyRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        body: verifyBody,
      }
    );

    const verifyJson = (await verifyRes.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!verifyJson.success) {
      logSecurityEvent("reCAPTCHA validation failed on registration", "medium", { errors: verifyJson["error-codes"] }, ip);
      const errUrl = new URL("/register-error/", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    // ✅ Create sanitized FormData for Formspree
    const sanitizedFormData = new FormData();
    sanitizedFormData.append("firstName", firstName);
    sanitizedFormData.append("lastName", lastName);
    sanitizedFormData.append("email", email);
    if (phone) sanitizedFormData.append("phone", phone);
    if (message) sanitizedFormData.append("message", message);

    // ✅ Forward to Formspree
    const formspreeEndpoint = "https://formspree.io/f/xldwoekj";

    const fsRes = await fetch(formspreeEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: sanitizedFormData,
    });

    if (!fsRes.ok) {
      logSecurityEvent("Formspree submission failed", "high", { status: fsRes.status }, ip);
      const errUrl = new URL("/register-error/", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    // ✅ Log successful registration
    logFormSubmission("registration", { status: "success", email: email }, ip);

    // 🎉 Success
    const okUrl = new URL("/thank-you/?event=Registration", request.url);
    return Response.redirect(okUrl.toString(), 303);
  } catch (err) {
    logSecurityEvent("Unexpected error in registration handler", "high", { error: String(err) }, ip);
    console.error("Unexpected error in /register", err);
    const errUrl = new URL("/register-error/", request.url);
    return Response.redirect(errUrl.toString(), 303);
  }
};

// Optional: handle GET /register (e.g. direct hits) with 404 or redirect
export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL("/", request.url);
  return Response.redirect(url.toString(), 302);
};
