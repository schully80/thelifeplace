export const onRequestPost: PagesFunction = async ({ request }) => {
  // Only allow POST
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const formData = await request.formData();

  // Simple honeypot: if "website" is filled, treat as bot
  const honey = formData.get("website");
  if (typeof honey === "string" && honey.trim() !== "") {
    return new Response(null, {
      status: 303,
      headers: { Location: "/thank-you?event=Registration" },
    });
  }

  // TODO: later we can forward to Formspree or send email here

  // For now, always treat as success and send them to Thank You
  return new Response(null, {
    status: 303,
    headers: { Location: "/thank-you?event=Registration" },
  });
};
