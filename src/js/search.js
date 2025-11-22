(function () {
  const html = document.documentElement;
  const overlay = document.getElementById("searchOverlay");
  const btnClose = document.getElementById("searchClose");
  const form = document.getElementById("siteSearchForm");
  const input = document.getElementById("siteSearchInputBar");
  const results = document.getElementById("searchResults");
  const btnClear = document.getElementById("searchClear");
  const openers = document.querySelectorAll("[data-search-open]");

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
  });

  btnClose?.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay?.getAttribute("aria-hidden") === "false") close(e);
  });

  btnClear?.addEventListener("click", () => {
    input.value = "";
    results.innerHTML = "";
    results.classList.add("hidden");
    input.focus();
  });

  async function loadIndex() {
    if (INDEX) return INDEX;
    try {
      const res = await fetch("/data/searchIndex.json", { cache: "no-cache" });
      INDEX = await res.json();
    } catch {
      INDEX = [];
    }
    return INDEX;
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const qRaw = input.value.trim().toLowerCase();
    if (!qRaw) return;

    const data = await loadIndex();
    const matched = data
      .map((item) => ({
        item,
        score: (item.title.toLowerCase().includes(qRaw) ? 5 : 0),
      }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    if (!matched.length) {
      results.innerHTML = `<p class="text-sm text-gray-500">No results found.</p>`;
      results.classList.remove("hidden");
      return;
    }

    results.innerHTML = matched
      .map(
        ({ item }) => `
      <a href="${item.url}" class="block rounded-md border p-3 hover:bg-gray-50 transition">
        <div class="font-semibold text-gray-900">${item.title}</div>
        <div class="text-sm text-gray-600 mt-1">${item.summary}</div>
      </a>`
      )
      .join("");

    results.classList.remove("hidden");
  });
})();
