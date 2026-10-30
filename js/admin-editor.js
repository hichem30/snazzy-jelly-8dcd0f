(() => {
  const sections = [
    { group: "Clinic", collection: "clinic-profile", slug: "profile", label: "Clinic profile & contact", icon: "fa-user-doctor" },
    { group: "Clinic", collection: "opening-hours", slug: "hours", label: "Opening hours", icon: "fa-clock" },
    { group: "Clinic", collection: "services", slug: "services", label: "Services", icon: "fa-stethoscope" },
    { group: "Clinic", collection: "appointments", slug: "appointments", label: "Appointments", icon: "fa-calendar-check" },
    { group: "Patients", collection: "patient-info", slug: "faqs-reviews", label: "FAQs & reviews", icon: "fa-circle-question" },
    { group: "Patients", collection: "health-resources", slug: "resources", label: "Health information", icon: "fa-heart-pulse" },
    { group: "Website", collection: "homepage", slug: "homepage", label: "Home page", icon: "fa-house-medical" },
    { group: "Website", collection: "shop", slug: "products", label: "Shop & products", icon: "fa-bag-shopping" },
    { group: "Website", collection: "blog", slug: "articles", label: "Blog articles", icon: "fa-newspaper" },
    { group: "Website", collection: "site-settings", slug: "settings", label: "Website & payment settings", icon: "fa-sliders" }
  ];

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const currentRoute = (section) =>
    `#/collections/${section.collection}/entries/${section.slug}`;

  function setNestedValue(target, path, value) {
    const parts = path.split(".");
    let node = target;
    for (const [index, part] of parts.slice(0, -1).entries()) {
      const key = /^\d+$/.test(part) ? Number(part) : part;
      const nextPart = parts[index + 1];
      if (!node[key] || typeof node[key] !== "object") {
        node[key] = /^\d+$/.test(nextPart) ? [] : {};
      }
      node = node[key];
    }
    const finalPart = parts.at(-1);
    node[/^\d+$/.test(finalPart) ? Number(finalPart) : finalPart] = value;
  }

  function getNestedValue(target, path) {
    return path.split(".").reduce((value, part) => value?.[/^\d+$/.test(part) ? Number(part) : part], target);
  }

  function cloneValue(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function resolveField(fields, path) {
    const parts = path.split(".");
    let field = fields.find((item) => item.name === parts[0]);
    for (const part of parts.slice(1)) {
      if (field?.widget === "object") {
        field = (field.fields || []).find((item) => item.name === part);
      } else if (field?.widget === "list" && /^\d+$/.test(part)) {
        field = Array.isArray(field.fields)
          ? { widget: "object", fields: field.fields }
          : field.field || { widget: "string" };
      } else {
        return null;
      }
    }
    return field || null;
  }

  function initialValue(field) {
    if (!field) return "";
    if (field.widget === "object") {
      return Object.fromEntries((field.fields || [])
        .filter((child) => child.widget !== "hidden")
        .map((child) => [child.name, initialValue(child)]));
    }
    if (field.widget === "list") return [];
    if (field.widget === "boolean") return field.default === true;
    if (field.widget === "number") return field.default ?? "";
    return field.default ?? "";
  }

  function mountWorkspace(adminRoot) {
    const editorContainer = adminRoot.querySelector('div[class*="EditorContainer"]');
    const nativeEditor = editorContainer?.querySelector('div[class*="-Editor "]');
    if (!editorContainer || !nativeEditor) return;
    if (editorContainer.querySelector(".clinic-admin-workspace")) return;

    const editorApi = window.CMS?.editor;
    if (!editorApi?.getCurrentEntry || !editorApi?.applyFieldPatch || !editorApi?.onEditorChange) {
      console.error("The Turbo editor bridge is unavailable; the clinic editor cannot load.");
      return;
    }

    const workspace = element("div", "clinic-admin-workspace");
    const navigation = element("aside", "clinic-workspace-nav");
    navigation.setAttribute("aria-label", "Clinic settings");
    navigation.id = "clinic-workspace-navigation";
    const navBrand = element("a", "clinic-workspace-brand");
    navBrand.href = "/admin/";
    navBrand.innerHTML = '<img src="/img/admin-logo.svg" alt="" width="34" height="34"><span><strong>Clinic website</strong><small>Manage your site</small></span>';
    navigation.append(navBrand);

    const groups = new Map();
    sections.forEach((section) => {
      if (!groups.has(section.group)) {
        const group = element("div", "clinic-workspace-group");
        group.append(element("p", "clinic-workspace-group-label", section.group));
        groups.set(section.group, group);
        navigation.append(group);
      }
      const link = element("a", "clinic-workspace-link");
      link.href = currentRoute(section);
      link.dataset.collection = section.collection;
      link.innerHTML = `<i class="fa-solid ${section.icon}" aria-hidden="true"></i><span>${section.label}</span>`;
      groups.get(section.group).append(link);
    });

    const navFooter = element("div", "clinic-workspace-nav-footer");
    navFooter.innerHTML = '<a href="/admin/"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Dashboard</a><a href="/" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> View website</a>';
    navigation.append(navFooter);
    navigation.addEventListener("click", (event) => {
      if (event.target.closest(".clinic-workspace-link")) {
        workspace.classList.remove("clinic-workspace-menu-open");
        mobileNavButton?.setAttribute("aria-expanded", "false");
        syncNavigationAccessibility();
      }
    });

    const content = element("main", "clinic-workspace-content");
    const contentHeader = element("header", "clinic-workspace-heading");
    const headingCopy = element("div");
    headingCopy.append(
      element("p", "clinic-workspace-eyebrow", "CLINIC WEBSITE"),
      element("h1", "clinic-workspace-title", "Settings")
    );
    const mobileNavButton = element("button", "clinic-workspace-menu");
    mobileNavButton.type = "button";
    mobileNavButton.setAttribute("aria-label", "Open settings navigation");
    mobileNavButton.setAttribute("aria-controls", navigation.id);
    mobileNavButton.setAttribute("aria-expanded", "false");
    mobileNavButton.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    mobileNavButton.addEventListener("click", () => {
      const isOpen = workspace.classList.toggle("clinic-workspace-menu-open");
      mobileNavButton.setAttribute("aria-expanded", String(isOpen));
      mobileNavButton.setAttribute("aria-label", isOpen ? "Close settings navigation" : "Open settings navigation");
      syncNavigationAccessibility();
      if (isOpen) navigation.querySelector(".clinic-workspace-link")?.focus();
    });
    contentHeader.append(mobileNavButton, headingCopy);
    const description = element("p", "clinic-workspace-description", "Edit the information patients see on your website.");
    const status = element("p", "clinic-workspace-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const fieldContainer = element("div", "clinic-workspace-fields");
    content.append(contentHeader, description, status, fieldContainer);
    workspace.append(navigation, content);
    const syncNavigationAccessibility = () => {
      navigation.inert = window.matchMedia("(max-width: 767px)").matches &&
        !workspace.classList.contains("clinic-workspace-menu-open");
    };
    window.addEventListener("resize", syncNavigationAccessibility);
    syncNavigationAccessibility();
    nativeEditor.hidden = true;
    nativeEditor.after(workspace);

    let latestSnapshot = null;
    let lastEntryKey = "";
    let fieldId = 0;

    const renderField = (field, path, value, parent) => {
      if (!field || field.widget === "hidden") return;
      if (field.widget === "object") {
        const fieldset = element("fieldset", "clinic-workspace-fieldset");
        const legend = element("legend", "", field.label || field.name);
        fieldset.append(legend);
        if (field.hint) fieldset.append(element("p", "clinic-workspace-hint", field.hint));
        (field.fields || []).forEach((child) =>
          renderField(child, `${path}.${child.name}`, value?.[child.name], fieldset)
        );
        parent.append(fieldset);
        return;
      }
      if (field.widget === "list") {
        const group = element("section", "clinic-workspace-list");
        const listHeader = element("div", "clinic-workspace-list-heading");
        const listTitle = element("h2", "", field.label || field.name);
        const addButton = element("button", "clinic-workspace-add", "Add");
        addButton.type = "button";
        addButton.dataset.listAdd = path;
        listHeader.append(listTitle, addButton);
        group.append(listHeader);
        if (field.hint) group.append(element("p", "clinic-workspace-hint", field.hint));
        const items = Array.isArray(value) ? value : [];
        if (!items.length) group.append(element("p", "clinic-workspace-empty", "No items yet."));
        items.forEach((item, index) => {
          const itemCard = element("section", "clinic-workspace-item");
          const itemHeading = element("div", "clinic-workspace-item-heading");
          const summaryValue = typeof item === "string"
            ? item
            : item?.title || item?.name || item?.question || item?.day || item?.date ||
              item?.ageGroup || item?.vaccine || `${field.label || field.name} ${index + 1}`;
          itemHeading.append(element("h3", "", summaryValue || `${field.label || field.name} ${index + 1}`));
          const removeButton = element("button", "clinic-workspace-remove", "Remove");
          removeButton.type = "button";
          removeButton.dataset.listRemove = path;
          removeButton.dataset.index = String(index);
          itemHeading.append(removeButton);
          itemCard.append(itemHeading);
          if (Array.isArray(field.fields)) {
            field.fields.forEach((child) =>
              renderField(child, `${path}.${index}.${child.name}`, item?.[child.name], itemCard)
            );
          } else if (field.field) {
            renderField(field.field, `${path}.${index}`, item, itemCard);
          } else {
            renderField({ name: "value", label: "Value", widget: "string" }, `${path}.${index}`, item, itemCard);
          }
          group.append(itemCard);
        });
        parent.append(group);
        return;
      }

      const fieldIdValue = `clinic-field-${++fieldId}`;
      const wrapper = element("div", "clinic-workspace-control");
      const label = element("label", "", field.label || field.name);
      label.htmlFor = fieldIdValue;
      const widget = field.widget || "string";
      let input;
      if (widget === "boolean") {
        wrapper.classList.add("clinic-workspace-control-toggle");
        input = element("input");
        input.type = "checkbox";
        input.checked = value === true;
        const toggleLabel = element("span", "clinic-workspace-toggle-label", field.label || field.name);
        label.textContent = "";
        label.append(input, element("span", "clinic-workspace-switch"), toggleLabel);
      } else if (widget === "select") {
        input = element("select");
        (field.options || []).forEach((option) => {
          const item = element("option", "", typeof option === "string" ? option : option.label);
          item.value = typeof option === "string" ? option : option.value;
          item.selected = item.value === value;
          input.append(item);
        });
      } else if (widget === "text" || widget === "markdown" || widget === "richtext") {
        input = element("textarea");
        input.rows = widget === "markdown" || widget === "richtext" ? 9 : 4;
        input.value = typeof value === "string" ? value : "";
      } else {
        input = element("input");
        input.type = widget === "number" ? "number" : "text";
        if (widget === "number") {
          if (field.min !== undefined) input.min = String(field.min);
          if (field.max !== undefined) input.max = String(field.max);
          if (field.step !== undefined) input.step = String(field.step);
        }
        input.value = value === undefined || value === null ? "" : String(value);
        if (widget === "image") {
          input.placeholder = "img/uploads/filename.jpg";
          input.autocomplete = "off";
        }
      }
      input.id = fieldIdValue;
      input.dataset.fieldPath = path;
      input.dataset.widget = widget;
      input.required = field.required === true;
      if (field.hint) {
        const hint = element("small", "clinic-workspace-hint", field.hint);
        wrapper.append(label);
        if (widget !== "boolean") wrapper.append(input);
        wrapper.append(hint);
      } else {
        wrapper.append(label);
        if (widget !== "boolean") wrapper.append(input);
      }
      if (widget === "image") {
        const preview = element("img", "clinic-workspace-image-preview");
        preview.alt = "";
        preview.hidden = !input.value;
        if (input.value) preview.src = input.value;
        input.addEventListener("input", () => {
          preview.hidden = !input.value;
          if (input.value) preview.src = input.value;
        });
        const uploadButton = element("button", "clinic-workspace-upload", "Choose from media library");
        uploadButton.type = "button";
        uploadButton.dataset.openNativeEditor = "";
        wrapper.append(preview, uploadButton);
      }
      parent.append(wrapper);
    };

    const renderSnapshot = (snapshot) => {
      const section = sections.find((item) => item.collection === snapshot.collection);
      if (!section) {
        status.textContent = "This section is not available in the clinic editor.";
        fieldContainer.replaceChildren();
        return;
      }
      const entryKey = `${snapshot.collection}:${snapshot.slug}:${snapshot.path}`;
      if (entryKey !== lastEntryKey) {
        lastEntryKey = entryKey;
        fieldId = 0;
        contentHeader.querySelector(".clinic-workspace-title").textContent = section.label;
        description.textContent = section.collection === "appointments"
          ? "Manage booking options and how appointment requests reach the clinic."
          : section.collection === "site-settings"
            ? "Control shared site options, contact forms, analytics, and myFatoorah payment links."
            : `Manage ${section.label.toLocaleLowerCase()} shown on the clinic website.`;
        navigation.querySelectorAll(".clinic-workspace-link").forEach((link) => {
          const active = link.dataset.collection === snapshot.collection;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
        fieldContainer.replaceChildren();
        const form = element("form", "clinic-workspace-form");
        form.addEventListener("submit", (event) => event.preventDefault());
        snapshot.fields.forEach((field) =>
          renderField(field, field.name, snapshot.data[field.name], form)
        );
        fieldContainer.append(form);
      } else {
        fieldContainer.querySelectorAll("[data-field-path]").forEach((input) => {
          if (input === document.activeElement) return;
          const value = getNestedValue(snapshot.data, input.dataset.fieldPath);
          if (input.type === "checkbox") input.checked = value === true;
          else input.value = value === undefined || value === null ? "" : String(value);
          if (input.dataset.widget === "image") {
            const preview = input.parentElement.querySelector(".clinic-workspace-image-preview");
            preview.hidden = !input.value;
            if (input.value) preview.src = input.value;
          }
        });
      }
      latestSnapshot = snapshot;
      status.textContent = snapshot.hasChanged
        ? "Unsaved changes — use Save or Publish above to apply them."
        : "All changes saved.";
      status.classList.toggle("has-unsaved-changes", snapshot.hasChanged);
    };

    const showLoading = () => {
      latestSnapshot = null;
      lastEntryKey = "";
      fieldContainer.replaceChildren(element("p", "clinic-workspace-loading", "Loading this section…"));
      status.textContent = "";
    };

    workspace.addEventListener("click", (event) => {
      if (event.target.closest("[data-open-native-editor]")) {
        nativeEditor.hidden = false;
        status.textContent = "Use Decap's original media controls above to select an uploaded image.";
        nativeEditor.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const addButton = event.target.closest("[data-list-add]");
      const removeButton = event.target.closest("[data-list-remove]");
      if (!addButton && !removeButton) return;
      event.preventDefault();
      if (!latestSnapshot) return;
      const listPath = (addButton || removeButton).dataset.listAdd || removeButton.dataset.listRemove;
      const parts = listPath.split(".");
      const rootName = parts[0];
      const rootField = latestSnapshot.fields.find((field) => field.name === rootName);
      const rootValue = cloneValue(latestSnapshot.data[rootName]) ?? initialValue(rootField);
      let list = rootValue;
      for (const part of parts.slice(1)) list = list[/^\d+$/.test(part) ? Number(part) : part];
      if (!Array.isArray(list)) return;
      if (addButton) {
        const listSchema = resolveField(latestSnapshot.fields, listPath);
        let newItem = "";
        if (Array.isArray(listSchema?.fields)) {
          newItem = Object.fromEntries(listSchema.fields
            .filter((field) => field.widget !== "hidden")
            .map((field) => [field.name, initialValue(field)]));
        } else if (listSchema?.field) newItem = initialValue(listSchema.field);
        list.push(newItem);
      } else {
        list.splice(Number(removeButton.dataset.index), 1);
      }
      const previousEntryKey = lastEntryKey;
      lastEntryKey = "";
      const result = editorApi.applyFieldPatch([{ path: rootName, value: rootValue }]);
      if (result.rejected.length) {
        lastEntryKey = previousEntryKey;
        renderSnapshot(latestSnapshot);
        status.textContent = `Could not update ${rootName}: ${result.rejected[0].reason}`;
        status.classList.add("has-error");
      } else {
        status.classList.remove("has-error");
        const updatedSnapshot = editorApi.getCurrentEntry();
        if (updatedSnapshot) renderSnapshot(updatedSnapshot);
      }
    });

    workspace.addEventListener("input", (event) => {
      if (event.target.matches("select, input[type=checkbox]")) return;
      updateField(event);
    });
    workspace.addEventListener("change", (event) => {
      if (!event.target.matches("select, input[type=checkbox]")) return;
      updateField(event);
    });

    function updateField(event) {
      const input = event.target.closest("[data-field-path]");
      if (!input || !latestSnapshot) return;
      if (input.type === "number" && input.value !== "" && !input.checkValidity()) return;
      const path = input.dataset.fieldPath;
      const rootName = path.split(".")[0];
      const rootField = latestSnapshot.fields.find((field) => field.name === rootName);
      const rootValue = cloneValue(latestSnapshot.data[rootName]) ?? initialValue(rootField);
      let value;
      if (input.type === "checkbox") value = input.checked;
      else if (input.type === "number") value = input.value === "" ? "" : Number(input.value);
      else value = input.value;
      if (path === rootName) {
        const result = editorApi.applyFieldPatch([{ path, value }]);
        if (result.rejected.length) status.textContent = `Could not update ${path}: ${result.rejected[0].reason}`;
        return;
      }
      setNestedValue(rootValue, path.slice(rootName.length + 1), value);
      const result = editorApi.applyFieldPatch([{ path: rootName, value: rootValue }]);
      if (result.rejected.length) {
        status.textContent = `Could not update ${path}: ${result.rejected[0].reason}`;
        status.classList.add("has-error");
      } else {
        status.classList.remove("has-error");
      }
    }

    const unsubscribe = editorApi.onEditorChange((snapshot) => {
      if (snapshot) renderSnapshot(snapshot);
      else if (lastEntryKey) showLoading();
    });
    editorContainer.dataset.clinicWorkspaceMounted = "true";
    const lifetimeObserver = new MutationObserver(() => {
      if (adminRoot.contains(editorContainer)) return;
      unsubscribe();
      window.removeEventListener("resize", syncNavigationAccessibility);
      lifetimeObserver.disconnect();
    });
    lifetimeObserver.observe(adminRoot, { childList: true, subtree: true });

    if (!/\/entries\//.test(window.location.hash)) {
      window.location.hash = currentRoute(sections[0]);
    }
    const snapshot = editorApi.getCurrentEntry();
    if (snapshot) renderSnapshot(snapshot);
    else showLoading();
  }

  window.installClinicAdminWorkspace = mountWorkspace;
})();
