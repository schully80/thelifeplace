const FORMSPREE_ENDPOINT = "https://formspree.io/f/xldwoekj";

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const accept = request.headers.get("accept") || "";
  const wantsJson = accept.includes("application/json");

  const json = (status: number, payload: unknown) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  const redirect = (location: string, status = 303) =>
    new Response(null, {
      status,
      headers: { Location: location },
    });

  try {
    if (request.method !== "POST") {
      if (wantsJson) {
        return json(405, { ok: false, error: "Method not allowed" });
      }
      return new Response("Method not allowed", { status: 405 });
    }

    // 1️⃣ Read form data
    const formData = await request.formData();

    // 2️⃣ Turnstile token
    const token = formData.get("cf-turnstile-response");
    if (!token) {
      if (wantsJson) {
        return json(400, { ok: false, error: "Captcha missing. Please try again." });
      }
      return redirect("/register-error");
    }

    const ip = request.headers.get("CF-Connecting-IP") || "";

    // 3️⃣ Verify with Turnstile
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: String(token),
          remoteip: ip,
        }),
      },
    );

    const verifyJson = await verifyRes.json();
    if (!verifyJson.success) {
      if (wantsJson) {
        return json(400, {
          ok: false,
          error: "Captcha check failed. Please tick the box and try again.",
        });
      }
      return redirect("/register-error");
    }

    // 4️⃣ Remove Turnstile field before sending onward
    formData.delete("cf-turnstile-response");

    // Build a simple object copy for logging / email
    const data: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        data[key] = value;
      }
    }

    // 5️⃣ Forward to Formspree
    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
      body.append(key, value);
    }

    const fsRes = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!fsRes.ok) {
      if (wantsJson) {
        return json(502, {
          ok: false,
          error: "Error submitting form. Please try again later.",
        });
      }
      return redirect("/register-error");
    }

    // 6️⃣ OPTIONAL: email notification + backup via Resend
    // Add these env vars in Pages:
    // RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_TO_EMAIL
    if (env.RESEND_API_KEY && env.RESEND_FROM_EMAIL && env.RESEND_TO_EMAIL) {
      const name =
        (data.firstName || "") +
        (data.lastName ? ` ${data.lastName}` : data.surname ? ` ${data.surname}` : "");

      const subject = name.trim()
        ? `New registration from ${name.trim()}`
        : "New registration submitted";

      // Fire-and-forget; if it fails, don't block the user
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: env.RESEND_FROM_EMAIL,
            to: env.RESEND_TO_EMAIL,
            subject,
            text:
              "New registration:\n\n" +
              Object.entries(data)
                .map(([k, v]) => `${k}: ${v}`)
                .join("\n"),
          }),
        });
      } catch {
        // Swallow errors here – you can add logging later if needed
      }
    }

    // 7️⃣ Success responses
    if (wantsJson) {
      // For JS-enhanced form
      return json(200, { ok: true });
    }

    // For plain POST form, redirect to thank-you page as "Registration"
    return redirect("/thank-you?event=Registration");
  } catch (err) {
    if (wantsJson) {
      return json(500, {
        ok: false,
        error: "Unexpected error. Please try again later.",
      });
    }
    return redirect("/register-error");
  }
};
