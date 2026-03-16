(function () {
  if (window.TLPFormController) return;

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ZA_PHONE_PATTERN = /^(?:\+27|0)[0-9]{9}$/;
  const DEFAULT_ERROR_TITLE = "We couldn't submit your form.";
  const DEFAULT_ERROR_DESCRIPTION = "Please review your details and try again.";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function resolveElement(target, fallback) {
    if (!target) return fallback;
    if (typeof target === "string") return document.querySelector(target) || fallback;
    return target;
  }

  function setButtonState(button, disabled, submitting) {
    if (!button) return;
    button.disabled = disabled;
    button.classList.toggle("opacity-60", disabled);
    button.classList.toggle("cursor-not-allowed", disabled);
    if (disabled) {
      button.setAttribute("aria-disabled", "true");
    } else {
      button.removeAttribute("aria-disabled");
    }
    if (submitting) {
      button.setAttribute("aria-busy", "true");
    } else {
      button.removeAttribute("aria-busy");
    }
  }

  function getActionArea(form, config) {
    return (
      form.querySelector(config.actionAreaSelector || "[data-tlp-action-area]") ||
      form.querySelector("#tlpSubmitBtn")?.closest("div") ||
      form.querySelector('button[type="submit"]')?.closest("div") ||
      form
    );
  }

  function getInlineMessage(root, form, actionArea) {
    let inlineMessage =
      root.querySelector("[data-tlp-inline-message]") ||
      form.querySelector("[data-tlp-inline-message]");

    if (!inlineMessage) {
      inlineMessage = document.createElement("div");
      inlineMessage.setAttribute("data-tlp-inline-message", "");
      inlineMessage.className = "hidden mt-4";
      form.appendChild(inlineMessage);
    }

    if (actionArea && actionArea.parentElement && inlineMessage !== actionArea.nextElementSibling) {
      actionArea.insertAdjacentElement("afterend", inlineMessage);
    }

    return inlineMessage;
  }

  function getTurnstileInput(form, config) {
    if (config.turnstileFieldName) {
      return form.querySelector(`input[name="${config.turnstileFieldName}"]`);
    }

    return form.querySelector(
      'input[name="cf-turnstile-response"], input[name^="cf-turnstile-response-"], input[name="turnstile-token"], input[name="token"]',
    );
  }

  function hasTurnstileToken(form, config) {
    if (config.turnstileOptional) return true;
    const input = getTurnstileInput(form, config);
    return !!(input && input.value && input.value.trim().length > 0);
  }

  function shouldValidateField(field) {
    if (!field || field.disabled) return false;
    const type = (field.type || "").toLowerCase();
    if (["hidden", "submit", "button", "reset"].includes(type)) return false;
    if ((field.name || "").startsWith("cf-turnstile-response")) return false;
    if (["turnstile-token", "token", "website", "_redirect", "tlp_start_time", "csrf_token"].includes(field.name || "")) {
      return false;
    }
    return (
      field.required ||
      type === "email" ||
      type === "tel" ||
      !!field.dataset.validate ||
      !!field.dataset.tlpValidate ||
      !!field.closest(".field")?.dataset.validate
    );
  }

  function validateField(field, options) {
    if (!shouldValidateField(field)) return true;

    const type = (field.type || "").toLowerCase();
    const rawValue = typeof field.value === "string" ? field.value : "";
    const value = rawValue.trim();
    const fieldValidator =
      field.dataset.validate ||
      field.dataset.tlpValidate ||
      field.closest(".field")?.dataset.validate;
    const showErrors = !!options?.showErrors;

    let valid = true;

    if ((type === "checkbox" || type === "radio") && field.required) {
      valid = field.checked;
    } else if (field.required && !value) {
      valid = false;
    } else if (value && (fieldValidator === "phone" || type === "tel")) {
      valid = ZA_PHONE_PATTERN.test(value.replace(/\s|-/g, ""));
    } else if (value && (fieldValidator === "email" || type === "email")) {
      valid = EMAIL_PATTERN.test(value);
    } else if (type === "number" && value) {
      const numeric = Number(value);
      valid = Number.isFinite(numeric);
      if (valid && field.min) {
        valid = numeric >= Number(field.min);
      }
    } else if (typeof field.checkValidity === "function") {
      valid = field.checkValidity();
    }

    const wrapper = field.closest(".field");
    if (wrapper) {
      wrapper.classList.toggle("show-error", showErrors && !valid);
      wrapper.classList.toggle("valid", valid && value.length > 0);
    }

    return valid;
  }

  function validateFormFields(form, options) {
    const fields = Array.from(form.querySelectorAll("input, textarea, select")).filter(shouldValidateField);
    let firstInvalid = null;
    let valid = true;

    fields.forEach((field) => {
      const wrapper = field.closest(".field");
      const showErrors = !!options?.forceShowErrors || !!options?.showTouchedErrors && !!wrapper?.dataset.tlpTouched;
      const fieldValid = validateField(field, { showErrors });
      if (!fieldValid && !firstInvalid) firstInvalid = field;
      if (!fieldValid) valid = false;
    });

    return { valid, firstInvalid };
  }

  function buildMessageMarkup(kind, title, description) {
    const tone =
      kind === "success"
        ? {
            container: "border-brand-red/100",
            iconWrap: "bg-brand-red/100 text-white",
            icon: '<i class="fa-solid fa-check" aria-hidden="true"></i>',
          }
        : kind === "warning"
          ? {
              container: "border-brand-red/200",
              iconWrap: "bg-brand-red text-white",
              icon: "!",
            }
          : {
              container: "border-red-200",
              iconWrap: "bg-red-100 text-red-700",
              icon: "!",
            };

    const safeTitle = escapeHtml(title);
    const safeDescription = description ? escapeHtml(description) : "";

    return `
      <div class="rounded-2xl bg-gray-50 border ${tone.container} shadow-sm p-4 md:p-5" data-inline-msg>
        <div class="flex items-start gap-3">
          <div class="h-10 w-10 rounded-full flex items-center justify-center text-xl ${tone.iconWrap}">${tone.icon}</div>
          <div class="text-left flex-1">
            <p class="text-lg font-semibold text-gray-800">${safeTitle}</p>
            ${safeDescription ? `<p class="text-sm text-gray-700 mt-1">${safeDescription}</p>` : ""}
          </div>
          <button
            type="button"
            class="ml-auto shrink-0 self-start inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-red text-white transition hover:bg-red-700"
            aria-label="Dismiss"
            data-action="dismiss"
          >
            <i class="fa-solid fa-x" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `;
  }

  function defaultErrorForReason(reason) {
    if (!reason) {
      return {
        title: DEFAULT_ERROR_TITLE,
        description: DEFAULT_ERROR_DESCRIPTION,
      };
    }

    const known = {
      incomplete: {
        title: "Please complete all required fields.",
        description: "Review the form and try again.",
      },
      invalid_email: {
        title: "Your email address looks invalid.",
        description: "Update it and submit again.",
      },
      invalid_phone: {
        title: "Your phone number looks invalid.",
        description: "Use a valid South African number and try again.",
      },
      missing_turnstile: {
        title: "Please complete the verification challenge.",
        description: "Then submit the form again.",
      },
      missing_token: {
        title: "Please complete the verification challenge.",
        description: "Then submit the form again.",
      },
      missing_input_response: {
        title: "Please complete the verification challenge.",
        description: "Then submit the form again.",
      },
      invalid_input_response: {
        title: "Your verification challenge expired.",
        description: "Complete it again and resubmit.",
      },
      timeout_or_duplicate: {
        title: "Your verification challenge expired.",
        description: "Complete it again and resubmit.",
      },
      turnstile_failed: {
        title: "We couldn't verify your submission.",
        description: "Please complete the challenge again.",
      },
      email_not_configured: {
        title: "Email delivery is not configured.",
        description: "Please try again later.",
      },
    };

    return known[reason] || {
      title: DEFAULT_ERROR_TITLE,
      description: `Error: ${reason}`,
    };
  }

  function resetTurnstile(form) {
    form.dispatchEvent(new Event("turnstile:reset"));
  }

  function init(userConfig) {
    const config = {
      submitMode: "json",
      successTitle: "Thank you! We've received your form.",
      successDescription: "A confirmation email has been sent.",
      duplicateTitle: "You've already submitted this form.",
      duplicateDescription: "If you need to update your details, reply to your confirmation email or contact us.",
      missingTurnstileTitle: "Please complete the verification challenge.",
      missingTurnstileDescription: "Then submit the form again.",
      requireTurnstileForEnable: false,
      resetOnSuccess: true,
      ...userConfig,
    };

    const root = resolveElement(config.root, null);
    if (!root || root.__tlpFormControllerReady) return;

    const form = resolveElement(config.form, root.querySelector("form"));
    if (!form) return;

    root.__tlpFormControllerReady = true;

    const submitButton = form.querySelector(config.submitSelector || 'button[type="submit"]');
    const actionArea = getActionArea(form, config);
    const inlineMessage = getInlineMessage(root, form, actionArea);
    let submitting = false;
    let hasSubmitted = false;

    function markTouched(target) {
      if (!(target instanceof HTMLElement)) return;
      const wrapper = target.closest(".field");
      if (!wrapper) return;
      wrapper.dataset.tlpTouched = "true";
    }

    function showActionArea() {
      if (actionArea) actionArea.style.display = "";
    }

    function hideActionArea() {
      if (actionArea) actionArea.style.display = "none";
    }

    function clearInlineMessage(resetForm) {
      inlineMessage.classList.add("hidden");
      inlineMessage.innerHTML = "";
      inlineMessage.style.display = "none";
      showActionArea();

      if (resetForm) {
        form.reset();
        resetTurnstile(form);
      }
    }

    function renderInlineMessage(kind, title, description, options) {
      const shouldHideActionArea = options?.hideActionArea ?? (kind === "success" || kind === "warning");

      inlineMessage.innerHTML = buildMessageMarkup(kind, title, description);
      inlineMessage.classList.remove("hidden");
      inlineMessage.style.display = "block";
      if (shouldHideActionArea) hideActionArea();
      inlineMessage.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function updateSubmitState() {
      const validation = validateFormFields(form, {
        forceShowErrors: hasSubmitted,
        showTouchedErrors: true,
      });
      if (typeof config.onUpdate === "function") {
        config.onUpdate({
          form,
          root,
          submitButton,
          validation,
          hasTurnstileToken: hasTurnstileToken(form, config),
        });
      }

      const canEnable =
        validation.valid &&
        (!config.requireTurnstileForEnable || hasTurnstileToken(form, config)) &&
        !submitting;

      setButtonState(submitButton, !canEnable, submitting);
      return validation;
    }

    inlineMessage.addEventListener("click", function (event) {
      const trigger = event.target instanceof HTMLElement ? event.target.closest('[data-action="dismiss"]') : null;
      if (!trigger) return;
      clearInlineMessage(config.resetOnDismiss);
      updateSubmitState();
    });

    form.addEventListener("input", function (event) {
      markTouched(event.target);
      updateSubmitState();
    });
    form.addEventListener("change", function (event) {
      markTouched(event.target);
      updateSubmitState();
    });
    form.addEventListener(
      "blur",
      function (event) {
        markTouched(event.target);
        updateSubmitState();
      },
      true,
    );
    form.addEventListener("turnstile:verified", updateSubmitState);
    form.addEventListener("turnstile:reset", function () {
      submitting = false;
      hasSubmitted = false;
      form.querySelectorAll(".field[data-tlp-touched]").forEach((field) => {
        delete field.dataset.tlpTouched;
      });
      setButtonState(submitButton, false, false);
      updateSubmitState();
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      clearInlineMessage(false);

      hasSubmitted = true;
      const validation = updateSubmitState();
      if (!validation.valid) {
        validation.firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof validation.firstInvalid?.reportValidity === "function") {
          validation.firstInvalid.reportValidity();
        }
        return;
      }

      if (!hasTurnstileToken(form, config)) {
        renderInlineMessage("error", config.missingTurnstileTitle, config.missingTurnstileDescription, {
          hideActionArea: false,
        });
        setButtonState(submitButton, false, false);
        return;
      }

      const formData = new FormData(form);

      if (typeof config.beforeSubmit === "function") {
        const beforeSubmitResult = await config.beforeSubmit({
          root,
          form,
          formData,
          renderInlineMessage,
          clearInlineMessage,
        });

        if (beforeSubmitResult === false) {
          updateSubmitState();
          return;
        }

        if (beforeSubmitResult && beforeSubmitResult.ok === false) {
          renderInlineMessage(
            beforeSubmitResult.kind || "error",
            beforeSubmitResult.title || DEFAULT_ERROR_TITLE,
            beforeSubmitResult.description || DEFAULT_ERROR_DESCRIPTION,
            { hideActionArea: beforeSubmitResult.hideActionArea ?? false },
          );
          updateSubmitState();
          return;
        }
      }

      submitting = true;
      setButtonState(submitButton, true, true);

      try {
        const response = await fetch(form.action, {
          method: form.method || "POST",
          body: formData,
          redirect: "follow",
          headers: config.submitMode === "json"
            ? {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-Fetch-JSON": "1",
              }
            : undefined,
        });

        const contentType = response.headers.get("content-type") || "";
        let payload = null;
        if (contentType.includes("application/json")) {
          payload = await response.json().catch(() => null);
        }

        if (response.ok || (response.status >= 300 && response.status < 400)) {
          if (typeof config.onSuccess === "function") {
            const handled = await config.onSuccess({
              root,
              form,
              formData,
              response,
              payload,
              renderInlineMessage,
              clearInlineMessage,
            });
            if (handled === false) {
              submitting = false;
              updateSubmitState();
              return;
            }
          } else {
            renderInlineMessage("success", config.successTitle, config.successDescription);
          }

          if (config.resetOnSuccess) {
            form.reset();
            resetTurnstile(form);
          }
          submitting = false;
          updateSubmitState();
          return;
        }

        const reason = payload?.reason || payload?.error || null;
        if (reason === "limit_reached") {
          renderInlineMessage("warning", config.duplicateTitle, config.duplicateDescription);
        } else {
          const details = defaultErrorForReason(reason);
          renderInlineMessage("error", details.title, details.description, { hideActionArea: false });
        }
      } catch (error) {
        renderInlineMessage("error", DEFAULT_ERROR_TITLE, "Network error. Please try again.", {
          hideActionArea: false,
        });
      } finally {
        submitting = false;
        updateSubmitState();
      }
    });

    updateSubmitState();
  }

  window.TLPFormController = { init, validateField, validateFormFields };
})();
