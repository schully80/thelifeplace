export const onRequestPost: PagesFunction = async (context) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();

    // 🐜 Honeypot check
    const website = (formData.get("website") || "").toString().trim();
    if (website) {
      // Likely a bot – pretend success but discard
      const url = new URL("/thank-you/?event=Registration", request.url);
      return Response.redirect(url.toString(), 303);
    }

    // 🔐 reCAPTCHA verification
    const recaptchaSecret = env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecret) {
      console.error("Missing RECAPTCHA_SECRET_KEY in environment");
      const errUrl = new URL("/register-error/", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    const recaptchaResponse =
      (formData.get("g-recaptcha-response") || "").toString().trim();

    if (!recaptchaResponse) {
      console.warn("Missing g-recaptcha-response");
      const errUrl = new URL("/register-error/", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    const verifyBody = new URLSearchParams({
      secret: recaptchaSecret,
      response: recaptchaResponse,
      // remoteip is optional; we can omit
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
      // score?: number; // for v3
      "error-codes"?: string[];
    };

    if (!verifyJson.success) {
      console.error("reCAPTCHA failed", verifyJson);
      const errUrl = new URL("/register-error/", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    // ✅ At this point, reCAPTCHA is OK – forward to Formspree
    const formspreeEndpoint = "https://formspree.io/f/xldwoekj";

    // You can pass the same FormData straight through
    const fsRes = await fetch(formspreeEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    if (!fsRes.ok) {
      console.error("Formspree error", fsRes.status);
      const errUrl = new URL("/register-error/", request.url);
      return Response.redirect(errUrl.toString(), 303);
    }

    // 🎉 All good – send the user to your existing thank-you page
    const okUrl = new URL("/thank-you/?event=Registration", request.url);
    return Response.redirect(okUrl.toString(), 303);
  } catch (err) {
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
