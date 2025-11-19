// 🔎 Search overlay + index
(function () {
  const html = document.documentElement;
  const overlay = document.getElementById("searchOverlay");
  const btnClose = document.getElementById("searchClose");
  const form = document.getElementById("siteSearchForm");
  const input = document.getElementById("siteSearchInputBar");
  const results = document.getElementById("searchResults");
  const btnClear = document.getElementById("searchClear");
  const openers = document.querySelectorAll("[data-search-open]");

  if (!overlay || !form || !input || !results) {
    // Search UI not present on this page
    return;
  }

  let INDEX = null;

  const open = (e) => {
    e?.preventDefault?.();
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    html.style.overflow = "hidden";
    setTimeout(() => input.focus(), 0);
  };

  const close = (e) => {
    e?.preventDefault?.();
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    html.style.overflow = "";
  };

  openers.forEach((btn) => {
    btn.addEventListener("click", open);
    btn.addEventListener("mousedown", (evt) => evt.preventDefault());
  });

  btnClose?.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close(e);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.getAttribute("aria-hidden") === "false")
      close(e);
    if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag !== "input" && tag !== "textarea") {
        e.preventDefault();
        open();
      }
    }
  });

  btnClear?.addEventListener("click", () => {
    input.value = "";
    results?.classList?.add("hidden");
    results.innerHTML = "";
    input.focus();
  });

  async function loadIndex() {
    if (INDEX) return INDEX;
    try {
      const res = await fetch("/src/data/searchIndex.json", { cache: "no-cache" });
      if (!res.ok) throw new Error("Index not found");
      INDEX = await res.json();
    } catch (e) {
      try {
        const res2 = await fetch("/data/searchIndex.json", { cache: "no-cache" });
        if (!res2.ok) throw new Error("Index not found (fallback)");
        INDEX = await res2.json();
      } catch {
        INDEX = [];
      }
    }
    return INDEX;
  }

  function norm(s) {
    return (s || "").toString().toLowerCase();
  }

  function rankItem(item, q) {
    const t = norm(item.title);
    const s = norm(item.summary);
    const tags = (item.tags || []).map(norm).join(" ");
    let score = 0;
    if (t.includes(q)) score += 5;
    if (s.includes(q)) score += 3;
    if (tags.includes(q)) score += 2;
    return score;
  }

  function highlight(text, q) {
    if (!text) return "";
    const safe = text.replace(/</g, "&lt;");
    if (!q) return safe;
    const re = new RegExp(
      "(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")",
      "ig"
    );
    return safe.replace(re, "<mark>$1</mark>");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const qRaw = input.value.trim();
    const q = qRaw.toLowerCase();
    if (!q) {
      results.innerHTML =
        '<p class="text-sm text-gray-500">Type something to search.</p>';
      results.classList.remove("hidden");
      return;
    }

    const data = await loadIndex();
    if (!data.length) {
      results.innerHTML =
        '<p class="text-sm text-gray-500">Search index not found. Add items to <code>src/data/searchIndex.json</code>.</p>';
      results.classList.remove("hidden");
      return;
    }

    const matched = data
      .map((item) => ({ item, score: rankItem(item, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    if (!matched.length) {
      results.innerHTML = `<p class="text-sm text-gray-500">No results for “${qRaw.replace(
        /</g,
        "&lt;"
      )}”.</p>`;
      results.classList.remove("hidden");
      return;
    }

    results.innerHTML = matched
      .map(
        ({ item }) => `
        <a href="${item.url}" class="block rounded-md border p-3 hover:bg-gray-50 transition">
          <div class="font-semibold text-gray-900">${highlight(
            item.title,
            qRaw
          )}</div>
          <div class="text-sm text-gray-600 mt-1">${highlight(
            item.summary,
            qRaw
          )}</div>
          <div class="text-[11px] text-gray-400 mt-1">${(item.tags || [])
            .map((t) => `#${t}`)
            .join(" ")}</div>
        </a>
      `
      )
      .join("");
    results.classList.remove("hidden");
  });
})();

// 💻 Desktop dropdowns (hover + keyboard)
(function () {
  const HIDE_DELAY = 220;
  document.querySelectorAll("[data-dropdown]").forEach((wrap) => {
    const btn = wrap.querySelector("[data-trigger]");
    const menu = wrap.querySelector("[data-menu]");
    if (!btn || !menu) return;

    let hideTimer;
    const open = () => {
      clearTimeout(hideTimer);
      menu.classList.remove("hidden");
      btn.setAttribute("aria-expanded", "true");
    };
    const close = () => {
      hideTimer = setTimeout(() => {
        menu.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
      }, HIDE_DELAY);
    };

    btn.addEventListener("mouseenter", open);
    btn.addEventListener("mouseleave", close);
    menu.addEventListener("mouseenter", open);
    menu.addEventListener("mouseleave", close);

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const isHidden = menu.classList.contains("hidden");
      isHidden ? open() : close();
    });

    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
        const first = menu.querySelector(
          "a,button,[tabindex]:not([tabindex='-1'])"
        );
        first?.focus();
      }
      if (e.key === "Escape") {
        close();
        btn.focus();
      }
    });

    menu.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        close();
        btn.focus();
      }
    });
  });

  document.addEventListener("click", (e) => {
    document
      .querySelectorAll("[data-dropdown] [data-menu]:not(.hidden)")
      .forEach((menu) => {
        if (!menu.closest("[data-dropdown]")?.contains(e.target)) {
          const btn = menu.parentElement?.querySelector?.("[data-trigger]");
          menu.classList.add("hidden");
          btn?.setAttribute("aria-expanded", "false");
        }
      });
  });
})();

// 🧁 Cookie banner close hook (optional safeguard)
document.addEventListener("DOMContentLoaded", () => {
  const btnClose = document.getElementById("btnClose");
  if (btnClose) {
    btnClose.addEventListener("click", () => {
      const el = document.getElementById("cookie-banner");
      if (el) el.classList.add("hidden");
    });
  }
});

