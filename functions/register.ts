import type { PagesFunction } from "@cloudflare/workers-types";
import { validateEmail, validatePhone, validateZAPhone, sanitizeName, sanitizeMessage, validateCSRFToken as validateCSRFFormat } from '../src/utils/validation';
import { logFormSubmission, logSecurityEvent } from '../src/utils/secure-logging';
import { getClientIP } from '../src/utils/api-auth';

type KVLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

export const onRequestPost = (async (context: any) => {
  const { request, env, ctx } = context as any;
  const envStage = (env?.STAGE || env?.NODE_ENV || "production").toString();
  const isDev = envStage === "development" || request.url.includes("localhost") || request.url.includes("127.0.0.1");
  const ip = getClientIP(request.headers);
  const acceptsJSON =
    (request.headers.get("accept") || "").includes("application/json") ||
    (request.headers.get("x-requested-with") || "").toLowerCase() === "xmlhttprequest" ||
    request.headers.get("x-fetch-json") === "1";

  try {
    const formData = await request.formData();

    // ✅ CSRF Token validation (skip in dev/local to allow forms without middleware injection)
    const csrfToken = (formData.get("csrf_token") || "").toString().trim();
    const csrfDisabled = env?.REGISTER_CSRF_DISABLED === "true" || env?.REGISTER_CSRF_DISABLE === "true";
    const csrfSafeToSkip = csrfDisabled || isDev || acceptsJSON;
    if (!csrfToken || !validateCSRFFormat(csrfToken)) {
      if (!csrfSafeToSkip) {
        logSecurityEvent("Invalid/missing CSRF token on registration", "high", { endpoint: "/register" }, ip);
        if (acceptsJSON) return new Response(JSON.stringify({ success: false, reason: "csrf" }), { status: 400, headers: { "Content-Type": "application/json" } });
        const errUrl = new URL("/register-error/?reason=csrf", request.url);
        return Response.redirect(errUrl.toString(), 303);
      }
    }

    // 🐜 Honeypot check
    const website = (formData.get("website") || "").toString().trim();
    if (website) {
      // Likely a bot – pretend success but discard
      logSecurityEvent("Honeypot triggered on registration form", "low", { endpoint: "/register" }, ip);
      if (acceptsJSON) return new Response(JSON.stringify({ success: true, bot: true }), { status: 200, headers: { "Content-Type": "application/json" } });
      const url = new URL("/thank-you/?event=Registration", request.url);
      return Response.redirect(url.toString(), 303);
    }

    // ✅ Input validation & sanitization
    const email = (formData.get("email") || "").toString().trim().toLowerCase();

    // Accept both split name fields and single fullName from older forms
    const rawFirst = (formData.get("firstName") || "").toString();
    const rawLast = (formData.get("lastName") || "").toString();
    const rawFull = (formData.get("fullName") || "").toString();

    let firstName = sanitizeName(rawFirst);
    let lastName = sanitizeName(rawLast);

    // Allow single-field name submissions (full name). If only one token is provided, reuse it for both fields
    if ((!firstName || !lastName) && rawFull) {
      const parts = rawFull.trim().split(/\s+/);
      const firstFromFull = sanitizeName(parts.shift() || "");
      const lastFromFull = sanitizeName(parts.join(" "));
      firstName = firstName || firstFromFull;
      lastName = lastName || lastFromFull || firstFromFull;
    }

    // Final fallback: if still missing lastName, mirror firstName to avoid false "incomplete"
    if (firstName && !lastName) {
      lastName = firstName;
    }

    const phoneRaw = ((formData.get("phone") || formData.get("contact") || "") as string).toString().trim();
    const phone = phoneRaw.replace(/\s|-/g, "");
    const whatsappOptInRaw = (formData.get("whatsapp_opt_in") || "").toString().toLowerCase();
    const whatsappOptIn = ["on", "true", "1", "yes"].includes(whatsappOptInRaw);
    const attendees = (formData.get("attendees") || "").toString().trim();
    const message = sanitizeMessage((formData.get("message") || "").toString());
    const intent = (formData.get("intent") || formData.get("eventName") || "Registration").toString();

    const normalizePhoneE164 = (val: string) => {
      const cleaned = val.replace(/[^\d+]/g, "");
      if (!cleaned) return "";
      if (cleaned.startsWith("+")) return cleaned;
      if (cleaned.startsWith("0")) return `+27${cleaned.slice(1)}`;
      if (cleaned.startsWith("27") && cleaned.length === 11) return `+${cleaned}`;
      return `+${cleaned}`;
    };

    // Validate required fields
    if (!email || !firstName || !lastName) {
      logFormSubmission("registration", { status: "missing_fields" }, ip);
      if (acceptsJSON) return new Response(JSON.stringify({ success: false, reason: "incomplete" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const errUrl = new URL("/register-error/?reason=incomplete", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    // Validate email format
    if (!validateEmail(email)) {
      logFormSubmission("registration", { status: "invalid_email" }, ip);
      if (acceptsJSON) return new Response(JSON.stringify({ success: false, reason: "invalid_email" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const errUrl = new URL("/register-error/?reason=invalid_email", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    // Validate phone if provided (ZA format preferred)
    if (phone && !(validateZAPhone(phone) || validatePhone(phone))) {
      logFormSubmission("registration", { status: "invalid_phone" }, ip);
      if (acceptsJSON) return new Response(JSON.stringify({ success: false, reason: "invalid_phone" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const errUrl = new URL("/register-error/?reason=invalid_phone", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }
    const whatsappPhone = phone ? normalizePhoneE164(phone) : "";

    // 🔐 Turnstile verification
    const turnstileToken =
      (formData.get("cf-turnstile-response") || "").toString().trim() ||
      (formData.get("turnstile-token") || "").toString().trim();

    const turnstileDisabled =
      env.REGISTER_TURNSTILE_DISABLED === "true" ||
      (isDev && env.REGISTER_TURNSTILE_DISABLE_DEV === "true");

    if (!turnstileToken && !turnstileDisabled) {
      logSecurityEvent("Missing Turnstile token on registration", "medium", { endpoint: "/register" }, ip);
      if (acceptsJSON) return new Response(JSON.stringify({ success: false, reason: "missing_turnstile" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const errUrl = new URL("/register-error/?reason=missing_turnstile", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    const resolveTurnstileSecret = () => {
      const candidates = [
        env.TURNSTILE_SECRET_KEY,
        env.TURNSTILE_SECRET,
        env.TURNSTILE_PRIVATE_KEY,
        env.CF_TURNSTILE_SECRET,
        env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
        env.TURNSTILE_SECRET_KEY_PROD,
      ];
      for (const val of candidates) {
        if (val && val.toString().trim()) return val.toString().trim();
      }
      return isDev ? "1x0000000000000000000000000000000AA" : undefined;
    };

    const turnstileSecret = resolveTurnstileSecret();

    if (!turnstileSecret && !turnstileDisabled) {
      logSecurityEvent("Missing TURNSTILE_SECRET_KEY", "high", { endpoint: "/register" }, ip);
      if (acceptsJSON) return new Response(JSON.stringify({ success: false, reason: "missing_secret" }), { status: 500, headers: { "Content-Type": "application/json" } });
      const errUrl = new URL("/register-error/?reason=missing_secret", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    if (!turnstileDisabled) {
      const verifyBody = new URLSearchParams({
        secret: turnstileSecret!.toString(),
        response: turnstileToken,
        remoteip: ip,
      });

      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
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
        logSecurityEvent("Turnstile validation failed on registration", "medium", { errors: verifyJson["error-codes"] }, ip);
        if (acceptsJSON) return new Response(JSON.stringify({ success: false, reason: "turnstile_failed", errors: verifyJson["error-codes"] || [] }), { status: 400, headers: { "Content-Type": "application/json" } });
        const errUrl = new URL("/register-error/?reason=turnstile_failed", request.url);
        return Response.redirect(errUrl.toString(), 303);
      }
    }

    // 🚦 One-per-visitor limit (email-based) for Plan a Visit
    const intentNormalized = intent.trim().toLowerCase();
    const kv = (env as any).VISIT_SUBMISSIONS as KVLike | undefined;
    const limitEnabled = env.VISIT_LIMIT_ENABLED !== "false"; // default on
    if (kv && limitEnabled && intentNormalized === "plan a visit" && email) {
      try {
        const key = `visit:${email}`;
        const existing = await kv.get(key);
        if (existing) {
          logFormSubmission("registration", { status: "limit_reached", email, intent }, ip);
          const payload = JSON.stringify({ success: false, reason: "limit_reached" });
          if (acceptsJSON) return new Response(payload, { status: 429, headers: { "Content-Type": "application/json" } });
          const errUrl = new URL("/register-error/?reason=limit_reached", request.url);
          return Response.redirect(errUrl.toString(), 303);
        }
        // store marker with TTL (1 year) to prevent repeated submissions
        await kv.put(key, "1", { expirationTtl: 60 * 60 * 24 * 365 });
      } catch (err) {
        logSecurityEvent("Visit KV error", "medium", { error: String(err) }, ip);
        // fail open: continue without blocking submission
      }
    }

    // ✅ Direct email via Resend (no Formspree)
    const resendKey =
      (env && env.RESEND_API_KEY)
      || (typeof process !== "undefined" ? process.env?.RESEND_API_KEY : undefined)
      || (typeof import.meta !== "undefined" ? (import.meta as any).env?.RESEND_API_KEY : undefined);
    const isVisitIntent = intent.trim().toLowerCase() === "plan a visit";

    const visitFrom = (env.RESEND_FROM_VISIT || env.RESEND_FROM_DEV || env.RESEND_FROM || env.MAIL_FROM || "visit@thelifeplace.org");

    const defaultFrom = isDev
      ? (env.RESEND_FROM_DEV || env.RESEND_FROM || env.MAIL_FROM || "prayer@thelifeplace.org")
      : (env.RESEND_FROM || env.MAIL_FROM || "visit@thelifeplace.org");

    const fromEmail = (isVisitIntent ? visitFrom : defaultFrom).toString();

    const teamEmail = (
      env.REGISTRATION_TEAM_EMAIL ||
      (isVisitIntent ? env.VISIT_TEAM_EMAIL || "hello@thelifeplace.org" : undefined) ||
      env.MAIL_TO ||
      "mystory@thelifeplace.org"
    ).toString();

    if (!resendKey) {
      logSecurityEvent("Resend API key missing", "high", { endpoint: "/register" }, ip);
      if (acceptsJSON) return new Response(JSON.stringify({ success: false, reason: "email_not_configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
      const errUrl = new URL("/register-error/?reason=email_not_configured", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    const submittedAt = new Date().toISOString();

    const addressFields = [
      "street_number",
      "street_name",
      "suburb",
      "city",
      "postal_code",
      "province",
      "country",
    ];

    const addressLines: string[] = [];
    addressFields.forEach((key) => {
      const val = (formData.get(key) || "").toString().trim();
      if (val) addressLines.push(`${key.replace(/_/g, " ")}: ${val}`);
    });

    const addressBlock = addressLines.length ? addressLines.join("\n") : "(not provided)";

    const defaultTeamSubject = `New ${intent} submission`;
    const defaultUserSubject = `We've received your ${intent} submission`;

    const defaultTeamBody = [
      `New registration submission`,
      `Intent: ${intent}`,
      `Name: ${firstName} ${lastName}`.trim(),
      `Email: ${email}`,
      `Phone: ${phone || "(not provided)"}`,
      attendees ? `Attendees: ${attendees}` : null,
      addressLines.length ? addressBlock : null,
      message ? `Message: ${message}` : null,
      `Submitted: ${submittedAt}`,
      `IP: ${ip}`,
    ].filter(Boolean).join("\n");

    const defaultUserBody = `Hi ${firstName || "there"},\n\nThank you for connecting with The Life Place. We received your ${intent} submission on ${submittedAt}.\n\nIf you need to update anything, just reply to this email.\n\nWith care,\nThe Life Place Team`;

    let teamSubject = defaultTeamSubject;
    let userSubject = defaultUserSubject;
    let teamBody = defaultTeamBody;
    let userBody = defaultUserBody;

    if (intentNormalized === "plan a visit") {
      teamSubject = "Plan a Visit submission";
      userSubject = "Your visit is booked with The Life Place";

      const addressForTeam = addressLines.length ? addressBlock : null;

      teamBody = [
        `Plan a Visit submission`,
        `Name: ${firstName} ${lastName}`.trim(),
        `Email: ${email}`,
        `Phone: ${phone || "(not provided)"}`,
        attendees ? `Attendees: ${attendees}` : null,
        addressForTeam ? `Address:\n${addressForTeam}` : null,
        message ? `Message: ${message}` : null,
        `Submitted: ${submittedAt}`,
        `IP: ${ip}`,
      ].filter(Boolean).join("\n");

      // Plain-text fallback for user is set below; HTML is injected during send
      userBody = `Hi ${firstName || "there"},\n\nThanks for planning a visit to The Life Place. We've received your details` +
        (attendees ? ` for ${attendees} attendee(s)` : "") +
        `. Our team will reach out if we need anything else.\n\nService times and directions: https://thelifeplace.org/visit\n\nIf something changes, just reply to this email.\n\nWe can’t wait to see you!\nThe Life Place Team`;
    }

    const sendWhatsAppConfirmation = async () => {
      if (!whatsappOptIn || !whatsappPhone) return;
      const waEnabled = env.WHATSAPP_ENABLED !== "false";
      const waToken = env.WHATSAPP_TOKEN || env.META_WHATSAPP_TOKEN;
      const waPhoneId = env.WHATSAPP_PHONE_ID || env.META_WHATSAPP_PHONE_ID;
      const waApiVersion = env.WHATSAPP_API_VERSION || "v19.0";
      if (!waEnabled) return;
      if (!waToken || !waPhoneId) {
        logSecurityEvent("WhatsApp not configured", "low", { endpoint: "/register" }, ip);
        return;
      }
      try {
        const waRes = await fetch(`https://graph.facebook.com/${waApiVersion}/${waPhoneId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${waToken}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: whatsappPhone,
            type: "text",
            text: {
              preview_url: false,
              body: `Hi ${firstName || "there"}, thanks for planning a visit to The Life Place. Your details are confirmed. Service info: ${env.VISIT_SERVICE_TIME || "Sundays 9:00–11:00am"} at ${env.VISIT_ADDRESS || "51 Villa Monte Catini\n1 Elm Avenue\nCraigavon AH, 2191\nSandton\nSouth Africa"}. Directions: ${env.VISIT_MAP_URL || "https://maps.app.goo.gl/Mk3pCED8Ubp4e8gF9"}`,
            },
          }),
        });
        if (!waRes.ok) {
          const detail = await waRes.text().catch(() => "");
          logSecurityEvent("WhatsApp send failed", "low", { status: waRes.status, detail }, ip);
        }
      } catch (err) {
        logSecurityEvent("WhatsApp send exception", "low", { error: String(err) }, ip);
      }
    };

    // Send to team
    try {
      const teamRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [teamEmail],
          subject: teamSubject,
          text: teamBody,
          // Optionally add HTML for admin in future
          reply_to: email,
        }),
      });
      if (!teamRes.ok) {
        const detail = await teamRes.text().catch(() => "");
        logSecurityEvent("Resend team email failed", "medium", { status: teamRes.status, detail }, ip);
        if (acceptsJSON && isDev) {
          return new Response(JSON.stringify({ success: false, reason: "team_email_failed", status: teamRes.status, detail }), { status: 502, headers: { "Content-Type": "application/json" } });
        }
      }
    } catch (err) {
      logSecurityEvent("Resend team email exception", "medium", { error: String(err) }, ip);
      // continue to confirmation + redirect
    }

    // Send confirmation to submitter
    try {
      let htmlBody = undefined;
      if (intentNormalized === "plan a visit") {
        // Dynamic import for ESM compatibility
        let visitConfirmHtml = null;
        try {
          visitConfirmHtml = (await import("../src/utils/visit-confirmation-email-template.js")).html;
        } catch (e) {
          logSecurityEvent("Failed to import visit confirmation HTML template", "medium", { error: String(e) }, ip);
        }
        if (typeof visitConfirmHtml === "function") {
          htmlBody = visitConfirmHtml({
            firstName,
            attendees,
            serviceTime: env.VISIT_SERVICE_TIME || "Sundays 9:00–11:00am",
            address: env.VISIT_ADDRESS || "51 Villa Monte Catini\n1 Elm Avenue\nCraigavon AH, 2191\nSandton\nSouth Africa",
            mapUrl: env.VISIT_MAP_URL || "https://maps.app.goo.gl/Mk3pCED8Ubp4e8gF9",
            logoUrl: env.VISIT_LOGO_URL || "https://thelifeplace.org/logo.png",
          });
        }
      }
      const userRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: userSubject,
          text: userBody,
          ...(htmlBody ? { html: htmlBody } : {}),
        }),
      });
      if (!userRes.ok) {
        const detail = await userRes.text().catch(() => "");
        logSecurityEvent("Resend confirmation email failed", "medium", { status: userRes.status, detail }, ip);
        if (acceptsJSON && isDev) {
          return new Response(JSON.stringify({ success: false, reason: "user_email_failed", status: userRes.status, detail }), { status: 502, headers: { "Content-Type": "application/json" } });
        }
      }
    } catch (err) {
      logSecurityEvent("Resend confirmation email exception", "medium", { error: String(err) }, ip);
    }

    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(sendWhatsAppConfirmation());
    } else {
      sendWhatsAppConfirmation();
    }

    logFormSubmission("registration", { status: "success", email: email, intent, whatsappOptIn }, ip);

    if (acceptsJSON) {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const okUrl = new URL("/thank-you/?event=Registration", request.url);
    return Response.redirect(okUrl.toString(), 303);
  } catch (err) {
    logSecurityEvent("Unexpected error in registration handler", "high", { error: String(err) }, ip);
    console.error("Unexpected error in /register", err);
    if (acceptsJSON) return new Response(JSON.stringify({ success: false, reason: "server_error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    const errUrl = new URL("/register-error/", request.url);
    return Response.redirect(errUrl.toString(), 303);
  }
}) as unknown as PagesFunction;

// Optional: handle GET /register (e.g. direct hits) with 404 or redirect
export const onRequestGet = (async ({ request }: { request: Request }) => {
  const url = new URL("/", request.url);
  return Response.redirect(url.toString(), 302);
}) as unknown as PagesFunction;
