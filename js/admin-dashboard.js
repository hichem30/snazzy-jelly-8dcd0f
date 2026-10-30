(() => {
  "use strict";

  const apiUrl = "/api/admin-api";
  const definitions = [
    { id: "hours", label: "Opening hours", icon: "H", file: "opening-hours.json", title: "Opening hours", description: "Keep the weekly schedule patients use to plan visits up to date." },
    { id: "appointments", label: "Appointments", icon: "A", file: "appointments.json", title: "Appointments", description: "Control the booking link and the appointment request form." },
    { id: "services", label: "Services", icon: "S", file: "services.json", title: "Services", description: "Manage the services patients can view and request." },
    { id: "shop", label: "Shop & payments", icon: "P", file: "shop.json", title: "Shop & payments", description: "Turn the shop on or off, update products, and manage payment links." },
    { id: "patients", label: "FAQs & reviews", icon: "F", file: "patient-info.json", title: "FAQs & reviews", description: "Keep answers current and publish reviews only with patient consent." },
    { id: "blog", label: "Blog articles", icon: "B", file: "blog.json", title: "Blog articles", description: "Write clinic-reviewed articles and choose which ones are published." }
  ];
  const states = new Map();
  const dirty = new Set();
  const fileById = new Map(definitions.map((definition) => [definition.id, `js/content/${definition.file}`]));
  fileById.set("payment-settings", "js/content/site-settings.json");
  const loginPanel = document.querySelector("#login-panel");
  const dashboard = document.querySelector("#dashboard");
  const loginForm = document.querySelector("#login-form");
  const loginMessage = document.querySelector("#login-message");
  const passwordInput = document.querySelector("#admin-password");
  const navigation = document.querySelector("#section-nav");
  const content = document.querySelector("#section-content");
  const saveButton = document.querySelector("#save-button");
  const saveMessage = document.querySelector("#save-message");
  const logoutButton = document.querySelector("#logout-button");
  let activeSection = definitions[0].id;
  let loading = false;
  let saving = false;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      cache: "no-store",
      credentials: "same-origin",
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "The request could not be completed.");
    return result;
  }

  function showLogin(message = "") {
    dashboard.hidden = true;
    loginPanel.hidden = false;
    logoutButton.hidden = true;
    loginMessage.textContent = message;
  }

  function showDashboard() {
    loginPanel.hidden = true;
    dashboard.hidden = false;
    logoutButton.hidden = false;
    renderNavigation();
    renderSection();
  }

  async function loadContent() {
    loading = true;
    try {
      await Promise.all(definitions.map(async (definition) => {
        const file = fileById.get(definition.id);
        const response = await request(`${apiUrl}?action=content&file=${encodeURIComponent(file)}`);
        states.set(definition.id, { data: response.data, sha: response.sha });
      }));
      const paymentResponse = await request(
        `${apiUrl}?action=content&file=${encodeURIComponent(fileById.get("payment-settings"))}`
      );
      states.set("payment-settings", { data: paymentResponse.data, sha: paymentResponse.sha });
      showDashboard();
      setSaveMessage("Content loaded. Save to publish your changes.", "neutral");
    } catch (error) {
      showLogin(error.message);
    } finally {
      loading = false;
    }
  }

  async function checkSession() {
    try {
      const result = await request(`${apiUrl}?action=session`);
      if (result.authenticated) await loadContent();
      else showLogin();
    } catch (error) {
      showLogin(error.message);
    }
  }

  function renderNavigation() {
    navigation.replaceChildren();
    definitions.forEach((definition, index) => {
      const button = element("button", "nav-button");
      button.type = "button";
      button.id = `tab-${definition.id}`;
      button.role = "tab";
      button.setAttribute("aria-controls", "section-content");
      button.setAttribute("aria-selected", String(definition.id === activeSection));
      button.tabIndex = definition.id === activeSection ? 0 : -1;
      button.dataset.section = definition.id;
      button.append(element("span", "nav-icon", definition.icon), element("span", "", definition.label));
      button.addEventListener("click", () => selectSection(definition.id));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === "Home" ? 0
          : event.key === "End" ? definitions.length - 1
            : (index + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) + definitions.length) % definitions.length;
        const nextTab = navigation.querySelectorAll(".nav-button")[nextIndex];
        selectSection(nextTab.dataset.section);
        if (activeSection === nextTab.dataset.section) {
          navigation.querySelector(`[data-section="${activeSection}"]`)?.focus();
        }
      });
      navigation.append(button);
    });
  }

  function selectSection(id) {
    if (id === activeSection) return;
    if (dirty.size && !window.confirm("You have unsaved changes. Discard them and switch sections?")) return;
    if (dirty.size) {
      const discarded = [...dirty];
      discarded.forEach((sectionId) => states.delete(sectionId));
      dirty.clear();
      activeSection = id;
      states.clear();
      loadContent();
      return;
    }
    activeSection = id;
    renderNavigation();
    renderSection();
  }

  function setSaveMessage(text, state = "neutral") {
    saveMessage.textContent = text;
    saveMessage.dataset.state = state;
  }

  function field(labelText, path, value, options = {}) {
    const wrapper = element("label", `field${options.wide ? " field-wide" : ""}`);
    wrapper.append(element("span", "", labelText));
    let control;
    if (options.type === "textarea") {
      control = element("textarea");
      control.rows = options.rows || 3;
    } else if (options.type === "select") {
      control = element("select");
      options.options.forEach(([optionValue, optionLabel]) => {
        const option = element("option", "", optionLabel);
        option.value = optionValue;
        control.append(option);
      });
    } else {
      control = element("input");
      control.type = options.type || "text";
      if (options.type === "number") {
        control.min = options.min ?? "0";
        control.step = options.step || "any";
      }
      if (options.required) control.required = true;
    }
    control.dataset.path = path;
    if (options.type === "checkbox") {
      wrapper.className = `toggle-field${options.wide ? " field-wide" : ""}`;
      control.checked = Boolean(value);
      const copy = element("span", "toggle-copy");
      copy.append(element("strong", "", labelText));
      if (options.hint) copy.append(element("small", "", options.hint));
      wrapper.replaceChildren(control, copy);
    } else {
      control.value = value ?? "";
      wrapper.append(control);
      if (options.hint) wrapper.append(element("small", "field-hint", options.hint));
    }
    return wrapper;
  }

  function card(title) {
    const wrapper = element("section", "settings-card");
    wrapper.append(element("h3", "", title));
    const grid = element("div", "field-grid");
    wrapper.append(grid);
    return { wrapper, grid };
  }

  function addFields(grid, items) {
    items.forEach(([label, path, options = {}]) => {
      grid.append(field(label, path, getValue(states.get(activeSection).data, path), options));
    });
  }

  function getValue(target, path) {
    return path.split(".").reduce((value, part) => value?.[/^\d+$/.test(part) ? Number(part) : part], target);
  }

  function setValue(target, path, value) {
    const parts = path.split(".");
    let node = target;
    parts.slice(0, -1).forEach((part, index) => {
      const key = /^\d+$/.test(part) ? Number(part) : part;
      const next = parts[index + 1];
      if (!node[key] || typeof node[key] !== "object") node[key] = /^\d+$/.test(next) ? [] : {};
      node = node[key];
    });
    const finalPart = parts.at(-1);
    node[/^\d+$/.test(finalPart) ? Number(finalPart) : finalPart] = value;
  }

  function addList(container, title, listPath, items, renderItem, makeItem) {
    const heading = element("div", "list-heading");
    heading.append(element("h3", "", title));
    const add = element("button", "button button-light");
    add.type = "button";
    add.textContent = "Add item";
    add.addEventListener("click", () => {
      items.push(makeItem());
      markDirty(activeSection);
      renderSection();
    });
    heading.append(add);
    container.append(heading);
    if (!items.length) container.append(element("p", "empty-list", `No ${title.toLowerCase()} added yet.`));
    items.forEach((item, index) => {
      const panel = element("article", "item-card");
      const itemHeading = element("div", "item-heading");
      const titleText = item.name || item.question || item.title || item.day || `${title.slice(0, -1)} ${index + 1}`;
      itemHeading.append(element("h4", "item-title", titleText));
      const remove = element("button", "button button-danger remove-button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        items.splice(index, 1);
        markDirty(activeSection);
        renderSection();
      });
      itemHeading.append(remove);
      panel.append(itemHeading);
      renderItem(panel, index, item);
      container.append(panel);
    });
  }

  function renderSection() {
    const definition = definitions.find((item) => item.id === activeSection);
    const state = states.get(activeSection);
    if (!state) return;
    content.replaceChildren();
    const inner = element("div", "section-content");
    inner.append(element("h2", "section-title", definition.title));
    inner.append(element("p", "section-description", definition.description));
    const data = state.data;

    if (activeSection === "hours") {
      const schedule = element("section", "settings-card");
      schedule.append(element("h3", "", "Weekly schedule"));
      data.hours.forEach((row, index) => {
        const rowFields = element("div", "field-grid");
        rowFields.append(element("div", "field", row.day));
        rowFields.append(field("Hours or closed", `hours.${index}.hours`, row.hours, { required: true }));
        schedule.append(rowFields);
      });
      inner.append(schedule);
    } else if (activeSection === "appointments") {
      const settings = card("Booking options");
      addFields(settings.grid, [
        ["Hosted booking page URL", "bookingUrl", { wide: true, hint: "Leave blank to use the clinic’s WhatsApp appointment request." }],
        ["Appointment request form introduction", "appointmentIntro", { type: "textarea", wide: true }],
        ["Submit button label", "appointmentSubmitLabel"],
        ["Show appointment request form", "appointmentRequestEnabled", { type: "checkbox", hint: "Turn off if patients should use a hosted booking page only." }],
        ["Ask for preferred date", "showPreferredDate", { type: "checkbox" }],
        ["Ask for preferred time", "showPreferredTime", { type: "checkbox" }],
        ["Show notes field", "showAppointmentNotes", { type: "checkbox" }],
        ["Offer calendar reminder", "calendarReminderEnabled", { type: "checkbox", hint: "The reminder is not an appointment confirmation." }]
      ]);
      inner.append(settings.wrapper);
    } else if (activeSection === "services") {
      addList(inner, "Services", "services", data.services, (panel, index) => {
        const grid = element("div", "field-grid");
        addFieldsAt(grid, [
          ["Service name", `services.${index}.name`, { required: true }],
          ["Duration", `services.${index}.duration`],
          ["Description", `services.${index}.description`, { type: "textarea", wide: true, required: true }],
          ["Fee information", `services.${index}.fee`],
          ["myFatoorah payment link", `services.${index}.paymentLink`, { type: "url", wide: true, hint: "Optional hosted payment link. The clinic must enable payment links in Shop & payments." }],
          ["Show this service", `services.${index}.enabled`, { type: "checkbox" }]
        ]);
        panel.append(grid);
      }, () => ({
        name: "", nameAr: "", nameHi: "", description: "", descriptionAr: "", descriptionHi: "",
        duration: "", durationAr: "", durationHi: "", fee: "", feeAr: "", feeHi: "",
        details: [], detailsAr: [], detailsHi: [], icon: "fa-stethoscope", paymentLink: "", enabled: true
      }));
    } else if (activeSection === "shop") {
      const settings = card("Shop and payment links");
      settings.grid.append(field("Enable the shop", "shopEnabled", data.shopEnabled, {
        type: "checkbox", wide: true, hint: "Turn the storefront off without removing its products or cart."
      }));
      const paymentField = field("Enable configured myFatoorah links", "paymentLinks.enabled",
        getValue(states.get("payment-settings").data, "paymentLinks.enabled"), {
          type: "checkbox", wide: true, hint: "Payment is handled by the clinic’s hosted myFatoorah pages."
        });
      paymentField.querySelector("[data-path]")?.setAttribute("data-settings-file", "payment-settings");
      settings.grid.append(paymentField);
      inner.append(settings.wrapper);
      addList(inner, "Products", "products", data.products, (panel, index) => {
        const grid = element("div", "field-grid");
        addFieldsAt(grid, [
          ["Product name", `products.${index}.name`, { required: true }],
          ["Price", `products.${index}.price`, { type: "number", min: "0", required: true }],
          ["Description", `products.${index}.description`, { type: "textarea", wide: true }],
          ["Image path or HTTPS URL", `products.${index}.image`, { wide: true, required: true, hint: "Use an image already available on the website, such as img/products/item.svg." }],
          ["Category", `products.${index}.category`, { type: "select", options: [["Medicines", "Medicines"], ["Supplements", "Supplements"], ["Medical Devices", "Medical Devices"]] }],
          ["myFatoorah payment link", `products.${index}.paymentLink`, { type: "url", wide: true, hint: "Optional hosted payment URL." }],
          ["Available", `products.${index}.inStock`, { type: "checkbox" }],
          ["Feature on the website", `products.${index}.featured`, { type: "checkbox" }]
        ]);
        panel.append(grid);
      }, () => ({
        name: "", description: "", price: 0, image: "", category: "Supplements",
        featured: false, inStock: true, paymentLink: ""
      }));
    } else if (activeSection === "patients") {
      addList(inner, "FAQs", "faqs", data.faqs, (panel, index) => {
        const grid = element("div", "field-grid");
        addFieldsAt(grid, [
          ["Category", `faqs.${index}.category`],
          ["Question", `faqs.${index}.question`, { wide: true, required: true }],
          ["Answer", `faqs.${index}.answer`, { type: "textarea", wide: true, required: true }],
          ["Show on the website", `faqs.${index}.enabled`, { type: "checkbox" }]
        ]);
        panel.append(grid);
      }, () => ({
        category: "General", categoryAr: "General", categoryHi: "General",
        question: "", questionAr: "", questionHi: "",
        answer: "", answerAr: "", answerHi: "", enabled: true
      }));
      addList(inner, "Patient reviews", "testimonials", data.testimonials, (panel, index) => {
        const grid = element("div", "field-grid");
        addFieldsAt(grid, [
          ["Display name", `testimonials.${index}.name`, { required: true }],
          ["Review", `testimonials.${index}.quote`, { type: "textarea", wide: true, required: true }],
          ["Patient consent confirmed", `testimonials.${index}.consentConfirmed`, { type: "checkbox", hint: "Required before the review can be shown." }],
          ["Approved by the clinic", `testimonials.${index}.approved`, { type: "checkbox", hint: "Required before the review can be shown." }]
        ]);
        panel.append(grid);
      }, () => ({
        name: "", quote: "", quoteAr: "", quoteHi: "",
        approved: false, consentConfirmed: false, image: ""
      }));
    } else if (activeSection === "blog") {
      inner.append(field("Enable the blog", "blogEnabled", data.blogEnabled, {
        type: "checkbox", wide: true, hint: "Hide published articles without deleting them."
      }));
      addList(inner, "Articles", "blogPosts", data.blogPosts, (panel, index) => {
        const grid = element("div", "field-grid");
        addFieldsAt(grid, [
          ["Title", `blogPosts.${index}.title`, { wide: true, required: true }],
          ["Summary", `blogPosts.${index}.excerpt`, { type: "textarea", wide: true, required: true }],
          ["Article", `blogPosts.${index}.body`, { type: "textarea", rows: 8, wide: true, required: true }],
          ["Publication date", `blogPosts.${index}.date`, { type: "date", required: true }],
          ["Category", `blogPosts.${index}.category`, { required: true }],
          ["Published", `blogPosts.${index}.published`, { type: "checkbox" }]
        ]);
        panel.append(grid);
      }, () => {
        const today = new Date();
        const date = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        return {
          title: "", titleAr: "", titleHi: "", excerpt: "", excerptAr: "", excerptHi: "",
          body: "", bodyAr: "", bodyHi: "", date, category: "General",
          categoryAr: "General", categoryHi: "General", published: false
        };
      });
    }

    content.replaceChildren(inner);
    content.setAttribute("role", "tabpanel");
    content.setAttribute("aria-labelledby", `tab-${activeSection}`);
    content.tabIndex = 0;
    saveButton.disabled = loading;
    updateSaveButton();
  }

  function addFieldsAt(grid, fields) {
    fields.forEach(([label, path, options = {}]) => {
      grid.append(field(label, path, getValue(states.get(activeSection).data, path), options));
    });
  }

  function markDirty(sectionId) {
    dirty.add(sectionId);
    setSaveMessage("Unsaved changes. Save to publish.", "neutral");
    updateSaveButton();
  }

  function updateSaveButton() {
    const hasCurrentChanges = dirty.has(activeSection) ||
      (activeSection === "shop" && dirty.has("payment-settings"));
    saveButton.textContent = hasCurrentChanges ? "Save changes" : "No unsaved changes";
    saveButton.disabled = loading || !hasCurrentChanges;
  }

  function onFieldChange(event) {
    if (saving) return;
    const control = event.target.closest("[data-path]");
    if (!control || !dashboard.contains(control)) return;
    const path = control.dataset.path;
    const value = control.type === "checkbox"
      ? control.checked
      : control.type === "number"
        ? Number(control.value)
        : control.value;
    const sectionId = activeSection;
    if (control.dataset.settingsFile === "payment-settings") {
      setValue(states.get("payment-settings").data, "paymentLinks.enabled", value);
      dirty.add("payment-settings");
    } else {
      setValue(states.get(sectionId).data, path, value);
      markDirty(sectionId);
      return;
    }
    setSaveMessage("Unsaved changes. Save to publish.", "neutral");
    updateSaveButton();
  }

  async function saveSection() {
    const sectionId = activeSection;
    if (saving || (!dirty.has(sectionId) && !(sectionId === "shop" && dirty.has("payment-settings")))) return;
    saveButton.disabled = true;
    saving = true;
    logoutButton.disabled = true;
    dashboard.querySelectorAll("input, select, textarea, button").forEach((control) => {
      control.disabled = true;
    });
    setSaveMessage("Saving and publishing…", "neutral");
    try {
      const keysToSave = sectionId === "shop"
        ? ["shop", "payment-settings"].filter((key) => dirty.has(key))
        : [sectionId];
      for (const key of keysToSave) {
        const state = states.get(key);
        const result = await request(`${apiUrl}?action=save`, {
          method: "POST",
          headers: { "X-Requested-With": "ClinicDashboard" },
          body: JSON.stringify({ file: fileById.get(key), sha: state.sha, data: state.data })
        });
        state.sha = result.sha;
        dirty.delete(key);
      }
      setSaveMessage("Saved. The website will update after deployment.", "success");
    } catch (error) {
      setSaveMessage(error.message, "error");
    } finally {
      saving = false;
      logoutButton.disabled = false;
      dashboard.querySelectorAll("input, select, textarea, button").forEach((control) => {
        control.disabled = false;
      });
      updateSaveButton();
    }
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginMessage.textContent = "Signing in…";
    const button = loginForm.querySelector("button");
    button.disabled = true;
    try {
      await request(`${apiUrl}?action=login`, {
        method: "POST",
        body: JSON.stringify({ password: passwordInput.value })
      });
      passwordInput.value = "";
      states.clear();
      await loadContent();
    } catch (error) {
      loginMessage.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  logoutButton.addEventListener("click", async () => {
    if (dirty.size && !window.confirm("You have unsaved changes. Sign out and discard them?")) return;
    try {
      await request(`${apiUrl}?action=logout`, { method: "POST", body: "{}" });
      states.clear();
      dirty.clear();
      showLogin("You have signed out.");
    } catch (error) {
      setSaveMessage(error.message, "error");
    }
  });

  document.querySelector("#dashboard").addEventListener("input", onFieldChange);
  document.querySelector("#dashboard").addEventListener("change", onFieldChange);
  saveButton.addEventListener("click", saveSection);
  checkSession();
})();
