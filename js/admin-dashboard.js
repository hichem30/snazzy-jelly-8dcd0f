(() => {
  "use strict";

  const apiUrl = "/api/admin-api";
  const definitions = [
    { id: "profile", label: "Doctor profile", icon: "D", file: "clinic-profile.json", title: "Doctor profile", description: "Update the clinic profile and doctor portrait." },
    { id: "hours", label: "Opening hours", icon: "H", file: "opening-hours.json", title: "Opening hours", description: "Keep the weekly schedule patients use to plan visits up to date." },
    { id: "appointments", label: "Appointments", icon: "A", file: "appointments.json", title: "Appointments", description: "Control the booking link and the appointment request form." },
    { id: "services", label: "Services", icon: "S", file: "services.json", title: "Services", description: "Manage the services patients can view and request." },
    { id: "shop", label: "Shop & payments", icon: "P", file: "shop.json", title: "Shop & payments", description: "Turn the shop on or off, update products, and manage payment links." },
    { id: "patients", label: "FAQs & reviews", icon: "F", file: "patient-info.json", title: "FAQs & reviews", description: "Keep answers current and publish reviews only with patient consent." },
    { id: "blog", label: "Blog articles", icon: "B", file: "blog.json", title: "Blog articles", description: "Write clinic-reviewed articles and choose which ones are published." }
  ];
  const arabic = {
    "View website": "عرض الموقع", "Website dashboard": "لوحة موقع العيادة",
    "Menu": "القائمة", "Language": "اللغة", "Use dark mode": "استخدم الوضع الداكن",
    "Use light mode": "استخدم الوضع الفاتح", "Admin sign in": "دخول المسؤول", "Sign out": "تسجيل الخروج",
    "PRIVATE CLINIC DASHBOARD": "لوحة تحكم العيادة الخاصة", "Sign in": "تسجيل الدخول",
    "Manage the clinic’s day-to-day website updates.": "إدارة تحديثات موقع العيادة اليومية.",
    "Dashboard password": "كلمة مرور لوحة التحكم", "Continue": "متابعة", "CLINIC OPERATIONS": "إدارة العيادة",
    "Website updates": "تحديثات الموقع", "Update the items that change during normal clinic operations.": "حدّث المعلومات التي تتغير ضمن العمل اليومي للعيادة.",
    "Saving publishes the update through the website deployment.": "يُنشر التحديث بعد حفظه ونشر الموقع.",
    "Changes are published when saved.": "تُنشر التغييرات عند حفظها.", "Save changes": "حفظ التغييرات",
    "No unsaved changes": "لا توجد تغييرات غير محفوظة", "Do not add patient medical records or other sensitive health information here.": "لا تضف سجلات المرضى أو معلومات صحية حساسة هنا.",
    "Doctor profile": "ملف الطبيب", "Opening hours": "ساعات العمل", "Appointments": "المواعيد", "Services": "الخدمات",
    "Shop & payments": "المتجر والمدفوعات", "FAQs & reviews": "الأسئلة الشائعة والتقييمات", "Blog articles": "مقالات المدونة",
    "Update the clinic profile and doctor portrait.": "حدّث ملف العيادة وصورة الطبيب.",
    "Keep the weekly schedule patients use to plan visits up to date.": "حدّث جدول المواعيد الأسبوعي للمرضى.",
    "Control the booking link and the appointment request form.": "تحكّم برابط الحجز ونموذج طلب الموعد.",
    "Manage the services patients can view and request.": "أدر الخدمات التي يمكن للمرضى الاطلاع عليها وطلبها.",
    "Turn the shop on or off, update products, and manage payment links.": "فعّل المتجر أو أوقفه، وحدّث المنتجات وروابط الدفع.",
    "Keep answers current and publish reviews only with patient consent.": "حدّث الإجابات ولا تنشر التقييمات إلا بموافقة المرضى.",
    "Write clinic-reviewed articles and choose which ones are published.": "اكتب مقالات تراجعها العيادة واختر ما يُنشر منها.",
    "Doctor and clinic details": "بيانات الطبيب والعيادة", "Doctor or clinic name": "اسم الطبيب أو العيادة",
    "Specialty": "التخصص", "Biography": "نبذة تعريفية", "Phone number": "رقم الهاتف", "Email address": "البريد الإلكتروني",
    "WhatsApp number": "رقم واتساب", "Clinic address": "عنوان العيادة", "Doctor portrait": "صورة الطبيب",
    "Visit information": "معلومات الزيارة", "Google Maps embed URL": "رابط تضمين خرائط Google",
    "Directions URL": "رابط الاتجاهات", "Parking information": "معلومات مواقف السيارات",
    "Accessibility information": "معلومات سهولة الوصول", "Google Business Profile URL": "رابط الملف التجاري على Google",
    "Social media links": "روابط التواصل الاجتماعي", "Instagram URL": "رابط Instagram",
    "Facebook URL": "رابط Facebook", "LinkedIn URL": "رابط LinkedIn",
    "Choose an image": "اختر صورة", "Replace image": "استبدال الصورة", "Image uploaded. Save changes to publish it.": "تم رفع الصورة. احفظ التغييرات لنشرها.",
    "Upload failed. Try again.": "تعذر رفع الصورة. حاول مرة أخرى.", "Images must be PNG, JPEG, or WebP and no larger than 3 MB.": "يجب أن تكون الصورة PNG أو JPEG أو WebP وألا يتجاوز حجمها 3 ميغابايت.",
    "Booking options": "خيارات الحجز", "Hosted booking page URL": "رابط صفحة الحجز", "Leave blank to use the clinic’s WhatsApp appointment request.": "اتركه فارغاً لاستخدام طلب الموعد عبر واتساب.",
    "Appointment request form introduction": "مقدمة نموذج طلب الموعد", "Submit button label": "نص زر الإرسال",
    "Show appointment request form": "إظهار نموذج طلب الموعد", "Turn off if patients should use a hosted booking page only.": "أوقفه إذا كان المرضى سيستخدمون صفحة الحجز فقط.",
    "Ask for preferred date": "طلب التاريخ المفضل", "Ask for preferred time": "طلب الوقت المفضل", "Show notes field": "إظهار حقل الملاحظات",
    "Offer calendar reminder": "إتاحة تذكير في التقويم", "The reminder is not an appointment confirmation.": "التذكير لا يعني تأكيد الموعد.",
    "Add item": "إضافة عنصر", "Remove": "حذف", "No products added yet.": "لم تتم إضافة منتجات بعد.",
    "No services added yet.": "لم تتم إضافة خدمات بعد.", "No faqs added yet.": "لم تتم إضافة أسئلة شائعة بعد.",
    "No patient reviews added yet.": "لم تتم إضافة تقييمات بعد.", "No articles added yet.": "لم تتم إضافة مقالات بعد.",
    "Weekly schedule": "الجدول الأسبوعي", "Hours or closed": "ساعات العمل أو مغلق", "Services": "الخدمات",
    "Service name": "اسم الخدمة", "Duration": "المدة", "Description": "الوصف", "Fee information": "الرسوم",
    "myFatoorah payment link": "رابط دفع myFatoorah", "Show this service": "إظهار هذه الخدمة",
    "Shop and payment links": "المتجر وروابط الدفع", "Enable the shop": "تفعيل المتجر",
    "Turn the storefront off without removing its products or cart.": "أوقف المتجر دون حذف المنتجات أو السلة.",
    "Enable configured myFatoorah links": "تفعيل روابط myFatoorah", "Payment is handled by the clinic’s hosted myFatoorah pages.": "تُعالج المدفوعات عبر صفحات myFatoorah الخاصة بالعيادة.",
    "Products": "المنتجات", "Product name": "اسم المنتج", "Price": "السعر", "Product image": "صورة المنتج",
    "Category": "الفئة", "Optional hosted payment URL.": "رابط دفع مستضاف اختياري.", "Available": "متوفر",
    "Feature on the website": "إبرازه على الموقع", "Medicines": "الأدوية", "Supplements": "المكملات",
    "Medical Devices": "الأجهزة الطبية", "FAQs": "الأسئلة الشائعة", "Question": "السؤال", "Answer": "الإجابة",
    "Show on the website": "إظهاره على الموقع", "Patient reviews": "تقييمات المرضى", "Display name": "الاسم المعروض",
    "Review": "التقييم", "Patient consent confirmed": "تم تأكيد موافقة المريض",
    "Required before the review can be shown.": "مطلوب قبل عرض التقييم.", "Approved by the clinic": "معتمد من العيادة",
    "Enable the blog": "تفعيل المدونة", "Hide published articles without deleting them.": "إخفاء المقالات المنشورة دون حذفها.",
    "Articles": "المقالات", "Title": "العنوان", "Summary": "الملخص", "Article": "المقال",
    "Publication date": "تاريخ النشر", "Published": "منشور", "Saving and publishing…": "جارٍ الحفظ والنشر…",
    "Unsaved changes. Save to publish.": "تغييرات غير محفوظة. احفظها للنشر.", "Saved. The website will update after deployment.": "تم الحفظ. سيُحدّث الموقع بعد النشر.",
    "You have unsaved changes. Discard them and switch sections?": "لديك تغييرات غير محفوظة. هل تريد تجاهلها والانتقال؟",
    "You have unsaved changes. Sign out and discard them?": "لديك تغييرات غير محفوظة. هل تريد تجاهلها وتسجيل الخروج؟",
    "Signing in…": "جارٍ تسجيل الدخول…", "Uploading image…": "جارٍ رفع الصورة…",
    "You have signed out.": "تم تسجيل خروجك.",
    "Choose an image": "اختر صورة",
    "This content changed elsewhere. Reload it and try again.": "تم تغيير المحتوى في مكان آخر. أعد تحميله وحاول مجدداً.",
    "Please sign in again.": "يرجى تسجيل الدخول مجدداً.", "That password was not accepted.": "كلمة المرور غير صحيحة.",
    "Could not load clinic content.": "تعذر تحميل محتوى العيادة.", "Could not save clinic content.": "تعذر حفظ محتوى العيادة.",
    "Could not upload this image.": "تعذر رفع الصورة.", "The request could not be completed.": "تعذر إكمال الطلب.",
    "Could not reach the publishing service. Try again later.": "تعذر الاتصال بخدمة النشر. حاول لاحقاً.",
    "Check product details, category, price, and payment links.": "تحقق من بيانات المنتج والفئة والسعر وروابط الدفع.",
    "Check the clinic profile details and choose a valid local portrait image.": "تحقق من بيانات العيادة واختر صورة محلية صالحة.",
    "Images must be no larger than 3 MB.": "يجب ألا يتجاوز حجم الصورة 3 ميغابايت.",
    "The image contents do not match PNG, JPEG, or WebP format.": "محتوى الصورة لا يطابق تنسيق PNG أو JPEG أو WebP.",
    "No unsaved changes": "لا توجد تغييرات غير محفوظة", "Menu": "القائمة",
    "Use dark mode": "استخدم الوضع الداكن", "Use light mode": "استخدم الوضع الفاتح",
    "Enable configured myFatoorah links": "تفعيل روابط myFatoorah"
  };
  const readPreference = (key, fallback) => {
    try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
  };
  let language = readPreference("clinic-dashboard-language", "en") === "ar" ? "ar" : "en";
  let isAuthenticated = false;
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
  const menuButton = document.querySelector("#menu-button");
  const menuPanel = document.querySelector("#dashboard-menu");
  const accountAction = document.querySelector("#account-action");
  const themeButton = document.querySelector("#theme-button");
  const themeLabel = document.querySelector("#theme-label");
  const themeIcon = document.querySelector("#theme-icon");
  let theme = readPreference("clinic-dashboard-theme", "light") === "dark" ? "dark" : "light";
  let activeSection = definitions[0].id;
  let loading = false;
  let saving = false;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function t(text) {
    return language === "ar" ? arabic[text] || text : text;
  }

  function applyLanguage() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    menuButton.setAttribute("aria-label", t("Menu"));
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll(".language-button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });
    menuPanel.querySelector(".language-switch")?.setAttribute(
      "aria-label",
      language === "ar" ? "لغة لوحة التحكم" : "Dashboard language"
    );
    try { localStorage.setItem("clinic-dashboard-language", language); } catch { /* Preference storage is optional. */ }
    themeLabel.textContent = t(theme === "dark" ? "Use light mode" : "Use dark mode");
    accountAction.textContent = t(isAuthenticated ? "Sign out" : "Admin sign in");
    if (!dashboard.hidden) {
      renderNavigation();
      renderSection();
    }
  }

  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#111a20" : "#f5f8fa";
    themeButton.setAttribute("aria-pressed", String(theme === "dark"));
    themeIcon.textContent = theme === "dark" ? "☀" : "☾";
    themeLabel.textContent = t(theme === "dark" ? "Use light mode" : "Use dark mode");
    try { localStorage.setItem("clinic-dashboard-theme", theme); } catch { /* Preference storage is optional. */ }
  }

  function closeMenu() {
    menuPanel.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
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
    isAuthenticated = false;
    loginMessage.textContent = t(message);
    accountAction.textContent = t("Admin sign in");
  }

  function showDashboard() {
    loginPanel.hidden = true;
    dashboard.hidden = false;
    isAuthenticated = true;
    accountAction.textContent = t("Sign out");
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
      button.append(element("span", "nav-icon", definition.icon), element("span", "", t(definition.label)));
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
    if (dirty.size && !window.confirm(t("You have unsaved changes. Discard them and switch sections?"))) return;
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
    saveMessage.textContent = t(text);
    saveMessage.dataset.state = state;
  }

  function field(labelText, path, value, options = {}) {
    const wrapper = element("label", `field${options.wide ? " field-wide" : ""}`);
    wrapper.append(element("span", "", t(labelText)));
    let control;
    if (options.type === "textarea") {
      control = element("textarea");
      control.rows = options.rows || 3;
    } else if (options.type === "select") {
      control = element("select");
      options.options.forEach(([optionValue, optionLabel]) => {
        const option = element("option", "", t(optionLabel));
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
      if (options.hint) copy.append(element("small", "", t(options.hint)));
      wrapper.replaceChildren(control, copy);
    } else {
      control.value = value ?? "";
      wrapper.append(control);
      if (options.hint) wrapper.append(element("small", "field-hint", t(options.hint)));
    }
    return wrapper;
  }

  function imageField(labelText, path, value) {
    const wrapper = element("div", "field image-field field-wide");
    const label = element("span", "image-field-label", t(labelText));
    const image = element("img", "image-preview");
    image.alt = t(labelText);
    if (typeof value === "string" && value.startsWith("img/") && !value.split("/").includes("..")) {
      image.src = `/${value}`;
    } else {
      image.hidden = true;
    }
    const uploadInput = element("input", "image-input");
    uploadInput.type = "file";
    uploadInput.accept = "image/png,image/jpeg,image/webp";
    uploadInput.setAttribute("aria-label", t("Choose an image"));
    uploadInput.dataset.imagePath = path;
    const status = element("span", "field-hint image-status");
    const uploadLabel = element("label", "button button-light upload-button", t(value ? "Replace image" : "Choose an image"));
    uploadLabel.append(uploadInput);
    wrapper.append(label, image, uploadLabel, status);
    return wrapper;
  }

  function toBase64(bytes) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return btoa(binary);
  }

  async function handleImageSelection(event) {
    const input = event.target.closest("input[type='file'][data-image-path]");
    if (!input || !input.files?.length) return;
    const [file] = input.files;
    const sectionId = activeSection;
    const path = input.dataset.imagePath;
    const status = input.closest(".image-field").querySelector(".image-status");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 3 * 1024 * 1024) {
      status.textContent = t("Images must be PNG, JPEG, or WebP and no larger than 3 MB.");
      input.value = "";
      return;
    }
    status.textContent = language === "ar" ? "جارٍ رفع الصورة…" : "Uploading image…";
    input.disabled = true;
    saving = true;
    try {
      const content = toBase64(new Uint8Array(await file.arrayBuffer()));
      const result = await request(`${apiUrl}?action=upload`, {
        method: "POST",
        body: JSON.stringify({ name: file.name, mimeType: file.type, content })
      });
      setValue(states.get(sectionId).data, path, result.path);
      markDirty(sectionId);
      const preview = input.closest(".image-field").querySelector(".image-preview");
      preview.src = `/${result.path}`;
      preview.hidden = false;
      status.textContent = t("Image uploaded. Save changes to publish it.");
      input.closest(".upload-button").firstChild.textContent = t("Replace image");
    } catch (error) {
      status.textContent = error.message || t("Upload failed. Try again.");
    } finally {
      saving = false;
      input.disabled = false;
      input.value = "";
      updateSaveButton();
    }
  }

  function card(title) {
    const wrapper = element("section", "settings-card");
    wrapper.append(element("h3", "", t(title)));
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
    heading.append(element("h3", "", t(title)));
    const add = element("button", "button button-light");
    add.type = "button";
    add.textContent = t("Add item");
    add.addEventListener("click", () => {
      items.push(makeItem());
      markDirty(activeSection);
      renderSection();
    });
    heading.append(add);
    container.append(heading);
    if (!items.length) container.append(element("p", "empty-list", t(`No ${title.toLowerCase()} added yet.`)));
    items.forEach((item, index) => {
      const panel = element("article", "item-card");
      const itemHeading = element("div", "item-heading");
      const titleText = item.name || item.question || item.title || item.day || `${title.slice(0, -1)} ${index + 1}`;
      itemHeading.append(element("h4", "item-title", titleText));
      const remove = element("button", "button button-danger remove-button");
      remove.type = "button";
      remove.textContent = t("Remove");
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
    inner.append(element("h2", "section-title", t(definition.title)));
    inner.append(element("p", "section-description", t(definition.description)));
    const data = state.data;

    if (activeSection === "profile") {
      const profile = card("Doctor and clinic details");
      addFields(profile.grid, [
        ["Doctor or clinic name", "doctorInfo.name", { required: true }],
        ["Specialty", "doctorInfo.specialty", { required: true }],
        ["Biography", "doctorInfo.bio", { type: "textarea", wide: true }],
        ["Phone number", "doctorInfo.phone"],
        ["Email address", "doctorInfo.email", { type: "email" }],
        ["WhatsApp number", "doctorInfo.whatsapp"],
        ["Clinic address", "doctorInfo.address", { wide: true }]
      ]);
      profile.wrapper.append(imageField("Doctor portrait", "doctorInfo.portrait", data.doctorInfo.portrait));
      inner.append(profile.wrapper);
      const visit = card("Visit information");
      addFields(visit.grid, [
        ["Google Maps embed URL", "doctorInfo.googleMapsEmbed", { type: "textarea", wide: true }],
        ["Directions URL", "doctorInfo.directionsUrl", { type: "url", wide: true }],
        ["Parking information", "doctorInfo.parking", { type: "textarea", wide: true }],
        ["Accessibility information", "doctorInfo.accessibility", { type: "textarea", wide: true }],
        ["Google Business Profile URL", "doctorInfo.googleBusinessProfile", { type: "url", wide: true }]
      ]);
      inner.append(visit.wrapper);
      const social = card("Social media links");
      addFields(social.grid, [
        ["Instagram URL", "doctorInfo.socialProfiles.instagram", { type: "url" }],
        ["Facebook URL", "doctorInfo.socialProfiles.facebook", { type: "url" }],
        ["LinkedIn URL", "doctorInfo.socialProfiles.linkedin", { type: "url" }]
      ]);
      inner.append(social.wrapper);
    } else if (activeSection === "hours") {
      const schedule = element("section", "settings-card");
      schedule.append(element("h3", "", t("Weekly schedule")));
      data.hours.forEach((row, index) => {
        const rowFields = element("div", "field-grid");
        const dayNames = language === "ar"
          ? { Sunday: "الأحد", Monday: "الاثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة", Saturday: "السبت" }
          : {};
        rowFields.append(element("div", "field", dayNames[row.day] || row.day));
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
          ["Category", `products.${index}.category`, { type: "select", options: [["Medicines", "Medicines"], ["Supplements", "Supplements"], ["Medical Devices", "Medical Devices"]] }],
          ["myFatoorah payment link", `products.${index}.paymentLink`, { type: "url", wide: true, hint: "Optional hosted payment URL." }],
          ["Available", `products.${index}.inStock`, { type: "checkbox" }],
          ["Feature on the website", `products.${index}.featured`, { type: "checkbox" }]
        ]);
        grid.append(imageField("Product image", `products.${index}.image`, data.products[index].image));
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
    saveButton.textContent = t(hasCurrentChanges ? "Save changes" : "No unsaved changes");
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
    accountAction.disabled = true;
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
      accountAction.disabled = false;
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
      loginMessage.textContent = t(error.message);
    } finally {
      button.disabled = false;
    }
  });

  async function signOut() {
    if (dirty.size && !window.confirm(t("You have unsaved changes. Sign out and discard them?"))) return;
    try {
      await request(`${apiUrl}?action=logout`, { method: "POST", body: "{}" });
      states.clear();
      dirty.clear();
      showLogin("You have signed out.");
    } catch (error) {
      setSaveMessage(error.message, "error");
    }
  }

  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuPanel.hidden = expanded;
    menuButton.setAttribute("aria-expanded", String(!expanded));
  });
  document.querySelectorAll(".language-button").forEach((button) => {
    button.addEventListener("click", () => {
      language = button.dataset.language === "ar" ? "ar" : "en";
      applyLanguage();
    });
  });
  themeButton.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    applyTheme();
  });
  accountAction.addEventListener("click", async () => {
    closeMenu();
    if (isAuthenticated) {
      await signOut();
      return;
    }
    showLogin();
    passwordInput.focus();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".menu-wrap")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuButton.focus();
    }
  });

  document.querySelector("#dashboard").addEventListener("input", onFieldChange);
  document.querySelector("#dashboard").addEventListener("change", onFieldChange);
  document.querySelector("#dashboard").addEventListener("change", handleImageSelection);
  saveButton.addEventListener("click", saveSection);
  applyTheme();
  applyLanguage();
  checkSession();
})();
