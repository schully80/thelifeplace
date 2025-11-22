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
      menu.classList.toggle("hidden");
    });
  });

  document.addEventListener("click", (e) => {
    document
      .querySelectorAll("[data-dropdown] [data-menu]:not(.hidden)")
      .forEach((menu) => {
        if (!menu.closest("[data-dropdown]").contains(e.target)) {
          const btn = menu.parentElement.querySelector("[data-trigger]");
          menu.classList.add("hidden");
          btn?.setAttribute("aria-expanded", "false");
        }
      });
  });
})();
