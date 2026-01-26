export default function initQuickGive(root) {
  if (!root) return;

  let frequency = "Once-off";
  let category = null;
  let amount = null;

  const freqBtns = root.querySelectorAll(".freqBtn");
  const categoryBtns = root.querySelectorAll(".categoryBtn");
  const amountBtns = root.querySelectorAll(".amountBtn");

  const methodStep = root.querySelector("#methodStep");
  const summaryText = root.querySelector("#summaryText");

  function updateSummary() {
    if (!category || !amount) return;

    summaryText.innerHTML = `
      <strong>You’re giving ${amount}</strong>
      (${frequency} · ${category})<br />
      <span class="text-gray-600 text-sm md:text-base">
        Choose how you’d like to give.
      </span>
    `;

    methodStep.classList.remove("hidden");

    // Smooth scroll with better mobile UX
    setTimeout(() => {
      methodStep.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  }

  // Frequency
  freqBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      frequency = btn.dataset.frequency;

      freqBtns.forEach((b) =>
        b.classList.remove("bg-white", "shadow-md", "text-gray-900")
      );
      btn.classList.add("bg-white", "shadow-md", "text-gray-900");

      updateSummary();
    });
  });

  // Category
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      category = btn.dataset.category;

      categoryBtns.forEach((b) =>
        b.classList.remove("border-brand-red", "ring-2", "ring-brand-red/30")
      );
      btn.classList.add("border-brand-red", "ring-2", "ring-brand-red/30");

      updateSummary();
    });
  });

  // Amount
  amountBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      amount = btn.dataset.amount;

      amountBtns.forEach((b) =>
        b.classList.remove("bg-brand-red", "text-white", "border-brand-red")
      );
      btn.classList.add("bg-brand-red", "text-white", "border-brand-red");

      updateSummary();
    });
  });
}
