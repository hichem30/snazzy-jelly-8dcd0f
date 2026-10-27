const themeKey = "doctor-clinic-theme";
let savedTheme = null;
try {
  savedTheme = localStorage.getItem(themeKey);
} catch (error) {
  console.warn("Could not read the saved theme preference.", error);
}
const initialTheme = savedTheme === "light" || savedTheme === "dark"
  ? savedTheme
  : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
document.documentElement.dataset.theme = initialTheme;

window.siteDataReady.then(({ products, doctorInfo, shopEnabled, services, hours, faqs, testimonials, blogEnabled, blogPosts, bookingUrl, cloudflareWebAnalyticsToken, introVideoUrl, emergencyInfo, firstAidSections, preparationGuides, vaccinationSchedule, prayerTimes, ramadanGuidance, seasonalHealthAlerts, paymentLinks }) => {
  for (const stylesheet of ["css/accessibility.css", "css/print.css"]) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = stylesheet;
    document.head.append(link);
  }
  if ("serviceWorker" in navigator &&
    (location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname))) {
    navigator.serviceWorker.register("./service-worker.js")
      .catch((error) => console.error("Could not register the offline page cache.", error));
  }
  document.querySelectorAll("a.whatsapp-float").forEach((link) => link.remove());
  document.querySelectorAll(".fa-solid, .fa-regular, .fa-brands").forEach((icon) => {
    icon.setAttribute("aria-hidden", "true");
  });
  const analyticsToken = cloudflareWebAnalyticsToken.trim();
  if (analyticsToken && /^[A-Za-z0-9_-]{8,128}$/.test(analyticsToken)) {
    const analyticsScript = document.createElement("script");
    analyticsScript.src = "https://static.cloudflareinsights.com/beacon.min.js";
    analyticsScript.defer = true;
    analyticsScript.dataset.cfBeacon = JSON.stringify({ token: analyticsToken });
    document.head.append(analyticsScript);
  } else if (analyticsToken) {
    console.warn("The Cloudflare Web Analytics site token has an invalid format.");
  }
  const videoSection = document.querySelector("[data-intro-video-section]");
  const videoContainer = document.querySelector("[data-intro-video]");
  if (videoSection && videoContainer && introVideoUrl.trim()) {
    try {
      const videoUrl = new URL(introVideoUrl);
      const isYoutubeHost = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(videoUrl.hostname);
      const videoId = videoUrl.hostname === "youtu.be"
        ? videoUrl.pathname.split("/").filter(Boolean)[0]
        : videoUrl.searchParams.get("v") || videoUrl.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
      if (isYoutubeHost && videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
        const videoFrame = document.createElement("iframe");
        videoFrame.className = "video-frame";
        videoFrame.title = document.documentElement.lang === "ar"
          ? "الفيديو التعريفي للعيادة"
          : "Introduction video for the clinic";
        videoFrame.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
        videoFrame.loading = "lazy";
        videoFrame.referrerPolicy = "strict-origin-when-cross-origin";
        videoFrame.allowFullscreen = true;
        videoFrame.allow = "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        videoContainer.append(videoFrame);
        videoSection.hidden = false;
      } else {
        console.warn("The configured introduction video URL is not a supported YouTube URL.");
      }
    } catch (error) {
      console.warn("The configured introduction video URL is invalid.", error);
    }
  }
  document.querySelectorAll(".language-switch").forEach((switcher) => {
    switcher.setAttribute("role", "group");
    if (!switcher.querySelector('[data-language="hi"]')) {
      const hindiButton = document.createElement("button");
      hindiButton.type = "button";
      hindiButton.dataset.language = "hi";
      hindiButton.textContent = "हिन्दी";
      hindiButton.setAttribute("aria-pressed", "false");
      switcher.append(hindiButton);
    }
  });
  const languageKey = "doctor-clinic-language";
  const translatedNodes = new WeakMap();
  const translatedAttributes = new WeakMap();
  const languageChangeCallbacks = [];
  const t = (text) => {
    const key = text
      .replaceAll(doctorInfo.name, "Dr. [Name]")
      .replaceAll(doctorInfo.specialty, "[Specialty]");
    const language = document.documentElement.lang;
    if (language === "en") return text;
    if (language === "hi") {
      const localizedSpecialty = doctorInfo.specialtyHi || doctorInfo.specialty;
      return (hindiTranslations[key] || text)
        .replaceAll("[Name]", doctorInfo.name.replace(/^Dr\.\s*/i, ""))
        .replaceAll("[Specialty]", localizedSpecialty);
    }
    const localizedName = doctorInfo.name.replace(/^Dr\.\s*/i, "");
    const localizedSpecialty = doctorInfo.specialty;
    return (arabicTranslations[key] || text)
      .replaceAll("[Name]", localizedName === "[Name]" ? "[الاسم]" : localizedName)
      .replaceAll("[Specialty]", localizedSpecialty === "[Specialty]" ? "[التخصص]" : localizedSpecialty);
  };

  async function shareOrCopy({ title, text, url, status }) {
    const shareData = { title, text, url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
        console.warn("Native sharing was unavailable; trying to copy the link.", error);
      }
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard access is unavailable.");
      await navigator.clipboard.writeText(`${text}\n${url}`);
      status.textContent = t("Link copied");
    } catch (error) {
      console.warn("Could not copy the share link.", error);
      window.prompt(t("Copy link"), `${text}\n${url}`);
    }
  }

  const isPlaceholder = (value) => !value?.trim() || /\[[^\]]+\]|drname\.kw|example\.(?:com|org|net)/i.test(value);
  const phoneNumber = doctorInfo.phone.replace(/[^\d+]/g, "");
  const validPhoneNumber = /^\+?\d{6,15}$/.test(phoneNumber) ? phoneNumber : "";
  const vCardButton = document.querySelector("[data-vcard-download]");
  if (vCardButton && !isPlaceholder(doctorInfo.name) && (validPhoneNumber || !isPlaceholder(doctorInfo.email))) {
    vCardButton.hidden = false;
    vCardButton.addEventListener("click", () => {
      const escapeVCard = (value) => value
        .replaceAll("\\", "\\\\")
        .replaceAll(";", "\\;")
        .replaceAll(",", "\\,")
        .replace(/\r?\n/g, "\\n");
      const fields = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${escapeVCard(doctorInfo.name)}`
      ];
      if (validPhoneNumber) fields.push(`TEL;TYPE=WORK,VOICE:${validPhoneNumber}`);
      if (!isPlaceholder(doctorInfo.email)) fields.push(`EMAIL;TYPE=WORK:${escapeVCard(doctorInfo.email)}`);
      if (!isPlaceholder(doctorInfo.address)) {
        fields.push(`ADR;TYPE=WORK:;;${escapeVCard(doctorInfo.address)};;;;`);
      }
      fields.push("END:VCARD");
      const url = URL.createObjectURL(new Blob([fields.join("\r\n")], { type: "text/vcard;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "clinic-contact.vcf";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
  const doctorShareButton = document.querySelector("[data-doctor-share]");
  if (doctorShareButton) {
    const shareDialog = document.createElement("dialog");
    shareDialog.className = "doctor-share-dialog";
    shareDialog.setAttribute("aria-labelledby", "doctor-share-title");
    const dialogHeader = document.createElement("div");
    dialogHeader.className = "doctor-share-dialog__header";
    const dialogTitle = document.createElement("h2");
    dialogTitle.id = "doctor-share-title";
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "doctor-share-dialog__close";
    closeButton.setAttribute("aria-label", "Close sharing options");
    closeButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    closeButton.addEventListener("click", () => shareDialog.close());
    dialogHeader.append(dialogTitle, closeButton);
    const shareOptions = document.createElement("div");
    shareOptions.className = "doctor-share-dialog__options";
    shareDialog.append(dialogHeader, shareOptions);
    document.body.append(shareDialog);

    doctorShareButton.addEventListener("click", () => {
      const language = document.documentElement.lang;
      const isArabic = language === "ar";
      const isHindi = language === "hi";
      const labels = isArabic
        ? { title: "شارك بطاقة الطبيب", close: "إغلاق خيارات المشاركة", whatsapp: "واتساب", facebook: "فيسبوك", linkedin: "لينكدإن", x: "تويتر", copy: "نسخ الرابط", native: "مشاركة…" }
        : isHindi
          ? { title: "डॉक्टर की जानकारी साझा करें", close: "साझाकरण विकल्प बंद करें", whatsapp: "WhatsApp", facebook: "Facebook", linkedin: "LinkedIn", x: "Twitter", copy: "लिंक कॉपी करें", native: "साझा करें…" }
          : { title: "Share doctor profile", close: "Close sharing options", whatsapp: "WhatsApp", facebook: "Facebook", linkedin: "LinkedIn", x: "Twitter", copy: "Copy link", native: "More sharing options…" };
      const name = doctorInfo.name;
      const specialty = isHindi ? (doctorInfo.specialtyHi || doctorInfo.specialty) : doctorInfo.specialty;
      const contact = [
        validPhoneNumber && `${t("Phone")}: ${validPhoneNumber}`,
        !isPlaceholder(doctorInfo.email) && `${t("Email")}: ${doctorInfo.email}`,
        !isPlaceholder(doctorInfo.address) && `${t("Address")}: ${doctorInfo.address}`
      ].filter(Boolean);
      const schedule = hours.map((row) =>
        `${isArabic ? row.dayAr : isHindi ? (row.dayHi || t(row.day)) : row.day}: ${isArabic ? row.hoursAr : isHindi ? (row.hoursHi || t(row.hours)) : row.hours}`
      );
      const heading = isArabic ? "بطاقة الطبيب" : isHindi ? "डॉक्टर का बिज़नेस कार्ड" : "Doctor business card";
      const publicUrl = new URL("about.html", location.href).href;
      const title = `${name} — ${specialty}`;
      const text = [heading, name, specialty, ...contact, t("Working schedule"), ...schedule].join("\n");
      const encodedUrl = encodeURIComponent(publicUrl);
      const encodedMessage = encodeURIComponent(`${text}\n${publicUrl}`);
      const socialLinks = [
        { label: labels.whatsapp, icon: "fa-brands fa-whatsapp", url: `https://wa.me/?text=${encodedMessage}` },
        { label: labels.facebook, icon: "fa-brands fa-facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
        { label: labels.linkedin, icon: "fa-brands fa-linkedin", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
        { label: labels.x, icon: "fa-brands fa-x-twitter", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${name} — ${specialty}`)}&url=${encodedUrl}` }
      ];
      dialogTitle.textContent = labels.title;
      closeButton.setAttribute("aria-label", labels.close);
      shareOptions.replaceChildren();
      socialLinks.forEach(({ label, icon, url }) => {
        const link = document.createElement("a");
        link.className = "doctor-share-dialog__option";
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        const iconElement = document.createElement("i");
        iconElement.className = icon;
        iconElement.setAttribute("aria-hidden", "true");
        link.append(iconElement, document.createTextNode(label));
        shareOptions.append(link);
      });
      if (navigator.share) {
        const nativeShareButton = document.createElement("button");
        nativeShareButton.type = "button";
        nativeShareButton.className = "doctor-share-dialog__option";
        nativeShareButton.textContent = labels.native;
        nativeShareButton.addEventListener("click", async () => {
          try {
            await navigator.share({ title, text, url: publicUrl });
            shareDialog.close();
          } catch (error) {
            if (error.name !== "AbortError") {
              console.warn("Could not open the system share sheet.", error);
            }
          }
        });
        shareOptions.append(nativeShareButton);
      }
      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "doctor-share-dialog__option";
      copyButton.textContent = labels.copy;
      copyButton.addEventListener("click", async () => {
        try {
          if (!navigator.clipboard?.writeText) throw new Error("Clipboard access is unavailable.");
          await navigator.clipboard.writeText(`${text}\n${publicUrl}`);
          const shareStatus = document.querySelector("[data-doctor-share-status]");
          if (shareStatus) shareStatus.textContent = t("Link copied");
          shareDialog.close();
        } catch (error) {
          console.warn("Could not copy the doctor profile share text.", error);
          window.prompt(labels.copy, `${text}\n${publicUrl}`);
        }
      });
      shareOptions.append(copyButton);
      if (!shareDialog.open) shareDialog.showModal();
    });
  }
  if ((location.pathname.split("/").pop() || "index.html") === "index.html" &&
    !isPlaceholder(doctorInfo.name) && !isPlaceholder(doctorInfo.address)) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "MedicalClinic",
      name: doctorInfo.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: doctorInfo.address,
        addressCountry: "KW"
      }
    };
    if (validPhoneNumber) schema.telephone = validPhoneNumber;
    if (!isPlaceholder(doctorInfo.email)) schema.email = doctorInfo.email;
    const structuredData = document.createElement("script");
    structuredData.type = "application/ld+json";
    structuredData.textContent = JSON.stringify(schema);
    document.head.append(structuredData);
  }

  const accessibilityToolbar = document.createElement("section");
  accessibilityToolbar.className = "accessibility-toolbar";
  accessibilityToolbar.innerHTML = `
    <button class="accessibility-toolbar__toggle" type="button" aria-expanded="false" aria-controls="accessibility-panel">
      <i class="fa-solid fa-person-walking" aria-hidden="true"></i>
      <span data-en="Accessibility" data-ar="إمكانية الوصول">Accessibility</span>
    </button>
    <div class="accessibility-toolbar__panel" id="accessibility-panel" hidden>
      <h2 data-en="Reading options" data-ar="خيارات القراءة">Reading options</h2>
      <div class="accessibility-toolbar__sizes" role="group" aria-label="Text size">
        <button type="button" data-font-scale="1" aria-label="100%" aria-pressed="false">100%</button>
        <button type="button" data-font-scale="1.25" aria-label="125%" aria-pressed="false">125%</button>
        <button type="button" data-font-scale="1.5" aria-label="150%" aria-pressed="false">150%</button>
        <button type="button" data-font-scale="2" aria-label="200%" aria-pressed="false">200%</button>
      </div>
      <button type="button" data-accessibility-toggle="accessibility-readable-font" aria-pressed="false" data-en="Readable font" data-ar="خط واضح">Readable font</button>
      <button type="button" data-accessibility-toggle="accessibility-underline-links" aria-pressed="false" data-en="Underline links" data-ar="تسطير الروابط">Underline links</button>
      <button type="button" data-accessibility-toggle="accessibility-high-contrast" aria-pressed="false" data-en="High contrast" data-ar="تباين عالٍ">High contrast</button>
      <button type="button" data-accessibility-toggle="accessibility-text-spacing" aria-pressed="false" data-en="Increase text spacing" data-ar="زيادة تباعد النص">Increase text spacing</button>
      <button type="button" data-accessibility-toggle="accessibility-reduced-motion" aria-pressed="false" data-en="Reduce motion" data-ar="تقليل الحركة">Reduce motion</button>
      <button type="button" class="accessibility-toolbar__reset" data-accessibility-reset data-en="Reset accessibility settings" data-ar="إعادة ضبط إعدادات إمكانية الوصول">Reset accessibility settings</button>
      <p class="accessibility-toolbar__status" role="status" aria-live="polite"></p>
    </div>`;
  document.body.append(accessibilityToolbar);
  const accessibilityPanel = accessibilityToolbar.querySelector(".accessibility-toolbar__panel");
  const accessibilityToggle = accessibilityToolbar.querySelector(".accessibility-toolbar__toggle");
  const accessibilityStatus = accessibilityToolbar.querySelector(".accessibility-toolbar__status");
  const updateAccessibilityLanguage = () => {
    accessibilityToolbar.querySelector(".accessibility-toolbar__sizes")
      .setAttribute("aria-label", document.documentElement.lang === "ar" ? "حجم النص" : t("Text size"));
    if (accessibilityStatus.dataset.resetNotice === "true") {
      accessibilityStatus.textContent = t("Settings reset.");
    }
  };
  updateAccessibilityLanguage();
  languageChangeCallbacks.push(updateAccessibilityLanguage);
  const accessibilitySettings = [
    ["accessibility-readable-font", "readableFont"],
    ["accessibility-underline-links", "underlineLinks"],
    ["accessibility-high-contrast", "highContrast"],
    ["accessibility-text-spacing", "textSpacing"],
    ["accessibility-reduced-motion", "reducedMotion"]
  ];
  const accessibilityTarget = (className) =>
    className === "accessibility-high-contrast" || className === "accessibility-reduced-motion"
      ? document.documentElement
      : document.body;
  try {
    const storedAccessibility = JSON.parse(localStorage.getItem("doctor-clinic-accessibility") || "{}");
    const savedAccessibility = storedAccessibility && typeof storedAccessibility === "object" &&
      !Array.isArray(storedAccessibility) ? storedAccessibility : {};
    const scale = [1, 1.25, 1.5, 2].includes(savedAccessibility.scale) ? savedAccessibility.scale : 1;
    document.documentElement.style.setProperty("--accessibility-font-scale", scale);
    accessibilityToolbar.querySelectorAll("[data-font-scale]").forEach((button) => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.fontScale) === scale));
    });
    accessibilitySettings.forEach(([className, setting]) => {
      const enabled = savedAccessibility[setting] === true;
      accessibilityTarget(className).classList.toggle(className, enabled);
      accessibilityToolbar.querySelector(`[data-accessibility-toggle="${className}"]`)
        .setAttribute("aria-pressed", String(enabled));
    });
  } catch (error) {
    console.warn("Could not load saved accessibility preferences.", error);
  }
  accessibilityToggle.addEventListener("click", () => {
    const isOpen = accessibilityToggle.getAttribute("aria-expanded") === "true";
    accessibilityToggle.setAttribute("aria-expanded", String(!isOpen));
    accessibilityPanel.hidden = isOpen;
  });
  accessibilityToolbar.addEventListener("click", (event) => {
    const fontButton = event.target.closest("[data-font-scale]");
    const settingButton = event.target.closest("[data-accessibility-toggle]");
    const resetButton = event.target.closest("[data-accessibility-reset]");
    if (!fontButton && !settingButton && !resetButton) return;
    let savedAccessibility = {};
    try {
      savedAccessibility = JSON.parse(localStorage.getItem("doctor-clinic-accessibility") || "{}");
      if (!savedAccessibility || typeof savedAccessibility !== "object" || Array.isArray(savedAccessibility)) {
        savedAccessibility = {};
      }
    } catch (error) {
      console.warn("Could not read saved accessibility preferences.", error);
    }
    if (resetButton) {
      document.documentElement.style.setProperty("--accessibility-font-scale", 1);
      accessibilityToolbar.querySelectorAll("[data-font-scale]").forEach((button) => {
        button.setAttribute("aria-pressed", String(Number(button.dataset.fontScale) === 1));
      });
      accessibilitySettings.forEach(([className]) => {
        accessibilityTarget(className).classList.remove(className);
        accessibilityToolbar.querySelector(`[data-accessibility-toggle="${className}"]`)
          .setAttribute("aria-pressed", "false");
      });
      savedAccessibility = {};
      accessibilityStatus.dataset.resetNotice = "true";
      updateAccessibilityLanguage();
    } else if (fontButton) {
      delete accessibilityStatus.dataset.resetNotice;
      accessibilityStatus.textContent = "";
      const scale = Number(fontButton.dataset.fontScale);
      document.documentElement.style.setProperty("--accessibility-font-scale", scale);
      accessibilityToolbar.querySelectorAll("[data-font-scale]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button === fontButton));
      });
      savedAccessibility.scale = scale;
    } else {
      delete accessibilityStatus.dataset.resetNotice;
      accessibilityStatus.textContent = "";
      const className = settingButton.dataset.accessibilityToggle;
      const target = accessibilityTarget(className);
      const enabled = !target.classList.contains(className);
      target.classList.toggle(className, enabled);
      settingButton.setAttribute("aria-pressed", String(enabled));
      const setting = accessibilitySettings.find(([name]) => name === className)?.[1];
      if (setting) savedAccessibility[setting] = enabled;
    }
    try {
      localStorage.setItem("doctor-clinic-accessibility", JSON.stringify(savedAccessibility));
    } catch (error) {
      console.warn("Could not save accessibility preferences.", error);
    }
  });

  const mobileDock = document.createElement("nav");
  mobileDock.className = "mobile-dock";
  mobileDock.setAttribute("aria-label", "Quick navigation");
  mobileDock.innerHTML = `
    <a href="index.html" data-dock-page="index.html"><i class="fa-solid fa-house" aria-hidden="true"></i><span data-en="Home" data-ar="الرئيسية">Home</span></a>
    <a href="services.html" data-dock-page="services.html"><i class="fa-solid fa-stethoscope" aria-hidden="true"></i><span data-en="Services" data-ar="الخدمات">Services</span></a>
    <a href="shop.html" data-dock-page="shop.html" data-dock-shop><i class="fa-solid fa-bag-shopping" aria-hidden="true"></i><span data-en="Shop" data-ar="المتجر">Shop</span><span class="dock-cart-count" data-dock-cart-count hidden>0</span></a>
    <a href="appointment.html" data-dock-page="appointment.html"><i class="fa-regular fa-calendar-check" aria-hidden="true"></i><span data-en="Book" data-ar="احجز">Book</span></a>
    <a href="contact.html" data-dock-page="contact.html"><i class="fa-regular fa-message" aria-hidden="true"></i><span data-en="Contact" data-ar="اتصل بنا">Contact</span></a>`;
  document.body.append(mobileDock);
  const whatsappFloat = document.createElement("a");
  whatsappFloat.className = "whatsapp-float whatsapp-contact-float";
  whatsappFloat.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i>';
  whatsappFloat.href = "#";
  const whatsappDigits = doctorInfo.whatsapp.replace(/\D/g, "");
  const hasWhatsAppNumber = /^\d{6,15}$/.test(whatsappDigits);
  if (hasWhatsAppNumber) {
    whatsappFloat.href = `https://wa.me/${whatsappDigits}`;
    whatsappFloat.target = "_blank";
    whatsappFloat.rel = "noopener noreferrer";
  } else {
    whatsappFloat.setAttribute("aria-disabled", "true");
    whatsappFloat.addEventListener("click", (event) => event.preventDefault());
  }
  const updateWhatsAppLabel = () => {
    const label = document.documentElement.lang === "ar"
      ? "تواصل مع العيادة عبر واتساب"
      : "Contact the clinic on WhatsApp";
    whatsappFloat.setAttribute("aria-label", label);
    whatsappFloat.title = hasWhatsAppNumber ? label :
      (document.documentElement.lang === "ar" ? "أضف رقم واتساب للعيادة في الإعدادات" : "Add the clinic WhatsApp number in settings");
  };
  updateWhatsAppLabel();
  document.body.append(whatsappFloat);
  languageChangeCallbacks.push(updateWhatsAppLabel);
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  mobileDock.querySelectorAll("[data-dock-page]").forEach((link) => {
    if (link.dataset.dockPage === currentPage) link.setAttribute("aria-current", "page");
  });

  const languageButtons = document.querySelectorAll("[data-language]");

  function setLanguage(language) {
    if (!["en", "ar", "hi"].includes(language)) language = "en";
    const isArabic = language === "ar";
    const isHindi = language === "hi";
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.body.classList.toggle("is-arabic", isArabic);
    document.body.classList.toggle("is-hindi", isHindi);
    document.querySelectorAll("[data-en][data-ar]").forEach((element) => {
      element.textContent = isArabic
        ? element.dataset.ar
        : isHindi
          ? (element.dataset.hi || t(element.dataset.en))
          : element.dataset.en;
    });
    const digits = doctorInfo.phone.replace(/\D/g, "");
    const countryPhone = digits.length > 3 ? `+${digits}` : "+965 [PHONE]";
    const replacements = new Map([
      ["Dr. [Name]", doctorInfo.name],
      ["[Name]", doctorInfo.name.replace(/^Dr\.\s*/i, "")],
      ["[الاسم]", doctorInfo.name.replace(/^Dr\.\s*/i, "")],
      ["[Specialty]", isHindi ? (doctorInfo.specialtyHi || doctorInfo.specialty) : doctorInfo.specialty],
      ["[التخصص]", doctorInfo.specialty],
      ["+965 [PHONE]", countryPhone],
      ["[PHONE]", digits.length > 3 ? digits.slice(3) : "[PHONE]"],
      ["info@drname.kw", doctorInfo.email],
      ["[Full clinic address, Kuwait]", doctorInfo.address]
    ]);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!translatedNodes.has(node)) translatedNodes.set(node, node.nodeValue);
      let text = translatedNodes.get(node);
      replacements.forEach((value, token) => {
        text = text.replaceAll(token, value);
      });
      if (isArabic || isHindi) {
        const trimmed = text.trim();
        let translated = t(trimmed);
        if (translated === trimmed) {
          translated = trimmed
            .replaceAll(doctorInfo.name, t(doctorInfo.name))
            .replaceAll("All rights reserved.", t("All rights reserved."));
        }
        if (translated !== trimmed) {
          const leading = text.match(/^\s*/)?.[0] || "";
          const trailing = text.match(/\s*$/)?.[0] || "";
          text = `${leading}${translated}${trailing}`;
        }
      }
      node.nodeValue = text;
    }
    if (!translatedAttributes.has(document.documentElement)) {
      translatedAttributes.set(document.documentElement, {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || ""
      });
    }
    const originalHead = translatedAttributes.get(document.documentElement);
    const title = originalHead.title
      .replaceAll("Dr. [Name]", doctorInfo.name)
      .replaceAll("[Specialty]", doctorInfo.specialty);
    document.title = isArabic || isHindi ? t(title) : title;
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      const localizedDescription = originalHead.description.replaceAll("Dr. [Name]", doctorInfo.name);
      description.content = isArabic || isHindi ? t(localizedDescription) : localizedDescription;
    }
    document.querySelectorAll("[placeholder], [aria-label], [title], [alt]").forEach((element) => {
      ["placeholder", "aria-label", "title", "alt"].forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        if (!translatedAttributes.has(element)) translatedAttributes.set(element, {});
        const originals = translatedAttributes.get(element);
        if (!(attribute in originals)) originals[attribute] = element.getAttribute(attribute);
        const original = originals[attribute];
        element.setAttribute(attribute, isArabic || isHindi ? t(original) : original);
      });
    });
    document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
      if (digits.length > 3) link.href = `tel:+${digits}`;
      else {
        link.href = "#";
        link.setAttribute("aria-disabled", "true");
      }
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
      link.href = `mailto:${doctorInfo.email}`;
    });
    document.querySelectorAll("[data-whatsapp]").forEach((link) => {
      const whatsappDigits = doctorInfo.whatsapp.replace(/\D/g, "");
      if (/^\d{6,15}$/.test(whatsappDigits)) {
        link.href = `https://wa.me/${whatsappDigits}`;
        link.removeAttribute("aria-disabled");
      } else {
        link.href = "#";
        link.setAttribute("aria-disabled", "true");
        link.title = t("Add the clinic's WhatsApp number in js/data.js");
      }
    });
    const mapElement = document.querySelector("#map-area");
    if (mapElement && /^https:\/\/\S+$/i.test(doctorInfo.googleMapsEmbed)) {
      const mapFrame = document.createElement("iframe");
      mapFrame.className = "map-frame";
      mapFrame.title = t("Map showing the clinic location");
      mapFrame.loading = "lazy";
      mapFrame.referrerPolicy = "no-referrer-when-downgrade";
      mapFrame.src = doctorInfo.googleMapsEmbed;
      mapElement.replaceWith(mapFrame);
    } else if (mapElement) {
      mapElement.hidden = true;
    }
    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });
    languageChangeCallbacks.forEach((callback) => callback());
    try {
      localStorage.setItem(languageKey, language);
    } catch (error) {
      console.warn("Could not save the language preference.", error);
    }
  }

  function renderServices() {
    document.querySelectorAll("[data-service-list]").forEach((container) => {
      const featuredOnly = container.dataset.serviceList === "featured";
      const visibleServices = services.filter((service) => service.enabled).slice(0, featuredOnly ? 3 : Infinity);
      container.innerHTML = visibleServices.map((service) => {
        const language = document.documentElement.lang;
        const name = language === "ar" ? service.nameAr : language === "hi" ? (service.nameHi || service.name) : service.name;
        const description = language === "ar" ? service.descriptionAr : language === "hi" ? (service.descriptionHi || service.description) : service.description;
        const duration = language === "ar" ? service.durationAr : language === "hi" ? (service.durationHi || service.duration) : service.duration;
        const fee = language === "ar" ? service.feeAr : language === "hi" ? (service.feeHi || t(service.fee)) : service.fee;
        const details = (language === "ar" ? service.detailsAr : language === "hi" ? (service.detailsHi || service.details) : service.details)
          .map((detail) => `<li>${escapeHtml(detail)}</li>`).join("");
        const icon = /^[a-z0-9-]+$/.test(service.icon || "") ? service.icon : "fa-stethoscope";
        const paymentUrl = validMyFatoorahUrl(service.paymentLink) && paymentLinks.enabled
          ? escapeHtml(service.paymentLink)
          : "";
        return `<article class="service-card">
          <span class="service-icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></span>
          <h${featuredOnly ? "3" : "2"}>${escapeHtml(name)}</h${featuredOnly ? "3" : "2"}>
          <p>${escapeHtml(description)}</p>
          ${duration || fee ? `<p class="service-meta">${duration ? `${escapeHtml(t("Typical duration:"))} ${escapeHtml(duration)}` : ""}${duration && fee ? " · " : ""}${fee ? `${escapeHtml(t("Fee:"))} ${escapeHtml(fee)}` : ""}</p>` : ""}
          ${details ? `<ul>${details}</ul>` : ""}
          ${featuredOnly ? "" : `<a class="button button-primary" href="appointment.html?service=${encodeURIComponent(service.name)}">${escapeHtml(t("Book Now"))}</a>`}
          ${paymentUrl ? `<a class="button button-secondary payment-link" href="${paymentUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("Pay online with myFatoorah"))}</a>` : ""}
        </article>`;
      }).join("");
      container.hidden = visibleServices.length === 0;
    });
  }

  function validMyFatoorahUrl(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    try {
      const url = new URL(value);
      return url.protocol === "https:" &&
        (url.hostname === "myfatoorah.com" || url.hostname.endsWith(".myfatoorah.com"));
    } catch (error) {
      console.warn("A configured myFatoorah payment link is invalid.", error);
      return false;
    }
  }

  function renderFaqs() {
    document.querySelectorAll("[data-faq-list]").forEach((container) => {
      const visibleFaqs = faqs.filter((faq) => faq.enabled);
      const language = document.documentElement.lang;
      const localized = (entry, field) => language === "ar"
        ? entry[`${field}Ar`] || entry[field]
        : language === "hi"
          ? entry[`${field}Hi`] || entry[field]
          : entry[field];
      const groups = new Map();
      visibleFaqs.forEach((faq) => {
        const category = localized(faq, "category");
        if (!groups.has(category)) groups.set(category, []);
        groups.get(category).push(faq);
      });
      container.innerHTML = [...groups].map(([category, entries]) =>
        `<section class="faq-category"><h2>${escapeHtml(category)}</h2>${entries.map((faq) => `
          <details><summary>${escapeHtml(localized(faq, "question"))}</summary>
          <p>${escapeHtml(localized(faq, "answer"))}</p></details>`).join("")}</section>`
      ).join("");
      container.hidden = visibleFaqs.length === 0;
    });
  }

  function renderTestimonials() {
    const approved = testimonials.filter((testimonial) => testimonial.approved && testimonial.consentConfirmed);
    document.querySelectorAll("[data-testimonial-list]").forEach((container) => {
      container.innerHTML = approved.map((testimonial) => {
        const language = document.documentElement.lang;
        const quote = language === "ar"
          ? (testimonial.quoteAr || testimonial.quote)
          : language === "hi"
            ? (testimonial.quoteHi || testimonial.quote)
            : testimonial.quote;
        const image = testimonial.image
          ? `<img src="${escapeHtml(testimonial.image)}" alt="">`
          : "";
        return `<article class="testimonial-card">${image}<blockquote>${escapeHtml(quote)}</blockquote><cite>${escapeHtml(testimonial.name)}</cite></article>`;
      }).join("");
      const section = container.closest("section");
      if (container.closest("main")?.querySelector(".hero")) {
        if (section) section.hidden = approved.length === 0;
      } else {
        const emptyMessage = document.querySelector("[data-testimonial-empty]");
        if (emptyMessage) emptyMessage.hidden = approved.length > 0;
        if (section) section.hidden = false;
      }
    });
  }

  function renderHours() {
    document.querySelectorAll(".hours-table tbody").forEach((body) => {
      const language = document.documentElement.lang;
      body.innerHTML = hours.map((row) => {
        const day = language === "ar" ? row.dayAr : language === "hi" ? (row.dayHi || t(row.day)) : row.day;
        const value = language === "ar" ? row.hoursAr : language === "hi" ? (row.hoursHi || t(row.hours)) : row.hours;
        return `<tr><th scope="row">${escapeHtml(day)}</th><td>${escapeHtml(value)}</td></tr>`;
      }).join("");
    });
    document.querySelectorAll(".site-footer .footer-grid > div:first-child p").forEach((paragraph) => {
      if (
        !paragraph.dataset.clinicHours &&
        !paragraph.textContent.includes("Sun–Thu") &&
        !paragraph.textContent.includes("Hours") &&
        !paragraph.textContent.includes("الأحد–الخميس") &&
        !paragraph.textContent.includes("ساعات العمل")
      ) return;
      paragraph.dataset.clinicHours = "true";
      const heading = document.createElement("strong");
      heading.textContent = t("Hours");
      paragraph.replaceChildren(heading, document.createElement("br"));
      hours.forEach((row, index) => {
        if (index) paragraph.append(document.createElement("br"));
        const language = document.documentElement.lang;
        paragraph.append(document.createTextNode(`${language === "ar" ? row.dayAr : language === "hi" ? (row.dayHi || t(row.day)) : row.day}: ${language === "ar" ? row.hoursAr : language === "hi" ? (row.hoursHi || t(row.hours)) : row.hours}`));
      });
    });
  }

  function renderLocationDetails() {
    document.querySelectorAll("[data-location-note]").forEach((element) => {
      const language = document.documentElement.lang;
      const parking = language === "ar" ? doctorInfo.parkingAr : language === "hi" ? (doctorInfo.parkingHi || doctorInfo.parking) : doctorInfo.parking;
      const accessibility = language === "ar" ? doctorInfo.accessibilityAr : language === "hi" ? (doctorInfo.accessibilityHi || doctorInfo.accessibility) : doctorInfo.accessibility;
      const details = [
        parking && [t("Parking"), parking],
        accessibility && [t("Accessibility"), accessibility]
      ].filter(Boolean);
      element.replaceChildren(...details.flatMap(([label, value]) => {
        const paragraph = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = `${label}: `;
        paragraph.append(strong, document.createTextNode(value));
        return [paragraph];
      }));
      element.hidden = details.length === 0;
    });
    document.querySelectorAll("[data-directions-link]").forEach((link) => {
      const customUrl = doctorInfo.directionsUrl.trim();
      const address = doctorInfo.address.trim();
      const addressIsConfigured = address && !/\[[^\]]+\]/.test(address);
      const wazeUrl = addressIsConfigured
        ? `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`
        : "";
      const url = customUrl || wazeUrl;
      const validUrl = /^https:\/\/\S+$/i.test(url);
      link.hidden = !validUrl;
      if (validUrl) {
        link.href = url;
        const directionLabel = customUrl ? "Get Directions" : "Open in Waze";
        link.textContent = document.documentElement.lang === "ar"
          ? (customUrl ? "احصل على الاتجاهات" : "افتح في Waze")
          : directionLabel;
        link.removeAttribute("aria-disabled");
        link.removeAttribute("tabindex");
      } else {
        link.href = "#";
        link.setAttribute("aria-disabled", "true");
        link.tabIndex = -1;
      }
    });
    document.querySelectorAll("[data-google-profile]").forEach((link) => {
      const url = doctorInfo.googleBusinessProfile.trim();
      const validUrl = /^https:\/\/\S+$/i.test(url);
      link.hidden = !validUrl;
      if (validUrl) link.href = url;
    });
    document.querySelectorAll("[data-social-profile]").forEach((link) => {
      const url = doctorInfo.socialProfiles[link.dataset.socialProfile].trim();
      const validUrl = /^https:\/\/\S+$/i.test(url);
      link.hidden = !validUrl;
      if (validUrl) link.href = url;
    });
    document.querySelectorAll(".social-links a").forEach((link) => {
      const platform = ["instagram", "facebook", "linkedin"].find((name) =>
        link.querySelector(`i.fa-${name}`)
      );
      if (!platform) return;
      const url = doctorInfo.socialProfiles[platform].trim();
      const validUrl = /^https:\/\/\S+$/i.test(url);
      link.hidden = !validUrl;
      if (validUrl) link.href = url;
    });
    document.querySelectorAll(".profile-social-links").forEach((group) => {
      group.hidden = ![...group.querySelectorAll("[data-social-profile]")].some((link) => !link.hidden);
    });
  }

  function renderServiceOptions() {
    const visibleServices = services.filter((service) => service.enabled);
    document.querySelectorAll("#appointment-service, #service").forEach((select) => {
      const placeholder = select.options[0];
      select.replaceChildren(placeholder, ...visibleServices.map((service) => {
        const option = document.createElement("option");
        option.value = service.name;
        const language = document.documentElement.lang;
        option.textContent = language === "ar" ? service.nameAr : language === "hi" ? (service.nameHi || service.name) : service.name;
        return option;
      }));
      const other = document.createElement("option");
      other.value = "Other";
      other.textContent = t("Other");
      select.append(other);
    });
  }

  function renderClinicBio() {
    const language = document.documentElement.lang;
    const bio = language === "ar" ? doctorInfo.bioAr : language === "hi" ? (doctorInfo.bioHi || doctorInfo.bio) : doctorInfo.bio;
    document.querySelectorAll("[data-clinic-bio]").forEach((element) => {
      element.textContent = bio;
      element.hidden = !bio.trim();
    });
  }

  function renderPatientInformation() {
    const isArabic = document.documentElement.lang === "ar";
    const isHindi = document.documentElement.lang === "hi";
    const emergencyNumber = (isArabic ? emergencyInfo.emergencyNumberAr : emergencyInfo.emergencyNumber) ||
      (isArabic ? emergencyInfo.emergencyNumber : emergencyInfo.emergencyNumberAr);
    const emergencyText = (isArabic ? emergencyInfo.emergencyMessageAr : isHindi ? emergencyInfo.emergencyMessageHi : emergencyInfo.emergencyMessage) ||
      (isArabic ? emergencyInfo.emergencyMessage : isHindi ? "" : emergencyInfo.emergencyMessageAr) ||
      (isArabic
        ? "عند الاشتباه بوجود حالة طارئة، اتصل بخدمات الطوارئ المحلية فوراً. لا تنتظر الرد عبر الموقع."
        : isHindi
          ? t(emergencyInfo.emergencyMessage || "For a suspected emergency, call 112 now or go to the nearest emergency department. Do not wait for a website reply.")
          : "For a suspected emergency, contact your local emergency service now. Do not wait for a website reply.");
    document.querySelectorAll("[data-emergency-message-inline], .emergency-note").forEach((element) => {
      element.textContent = emergencyText;
    });
    const emergencyMessage = document.querySelector("[data-emergency-message]");
    const emergencyNumberElement = document.querySelector("[data-emergency-number]");
    const emergencyCall = document.querySelector("[data-emergency-call]");
    if (emergencyMessage && emergencyNumberElement && emergencyCall) {
      emergencyMessage.textContent = emergencyText;
      const telNumber = emergencyNumber.replace(/[^\d+]/g, "");
      const validNumber = /^\+?\d{3,15}$/.test(telNumber);
      emergencyNumberElement.textContent = validNumber ? emergencyNumber : "";
      emergencyCall.hidden = !validNumber;
      if (validNumber) emergencyCall.href = `tel:${telNumber}`;
    }

    const renderCards = (containerSelector, sectionSelector, entries, getTitle, getBody) => {
      const container = document.querySelector(containerSelector);
      const section = document.querySelector(sectionSelector);
      if (!container || !section) return;
      const cards = entries.map((entry) => {
        const article = document.createElement("article");
        article.className = "information-card";
        const heading = document.createElement("h3");
        heading.textContent = getTitle(entry);
        const body = document.createElement("p");
        body.textContent = getBody(entry);
        article.append(heading, body);
        return article;
      });
      container.replaceChildren(...cards);
      section.hidden = cards.length === 0;
    };
    renderCards(
      "[data-first-aid-list]", "[data-first-aid-section]",
      firstAidSections.filter((entry) => entry.enabled),
      (entry) => isArabic ? entry.titleAr : entry.title,
      (entry) => isArabic ? entry.bodyAr : entry.body
    );
    renderCards(
      "[data-preparation-list]", "[data-preparation-section]",
      preparationGuides.filter((entry) => entry.published),
      (entry) => isArabic ? entry.titleAr : entry.title,
      (entry) => isArabic ? entry.bodyAr : entry.body
    );
  }

  function renderManagedTools() {
    const isArabic = document.documentElement.lang === "ar";
    const isHindi = document.documentElement.lang === "hi";
    const localized = (entry, field) => isArabic
      ? (entry[`${field}Ar`] || entry[field])
      : isHindi
        ? (entry[`${field}Hi`] || entry[field])
        : entry[field];
    const renderList = (sectionSelector, listSelector, items, renderCard) => {
      const section = document.querySelector(sectionSelector);
      const list = document.querySelector(listSelector);
      if (!section || !list) return;
      const cards = items.map(renderCard);
      list.replaceChildren(...cards);
      section.hidden = cards.length === 0;
    };
    const card = (title, body, extra) => {
      const article = document.createElement("article");
      article.className = "information-card";
      const heading = document.createElement("h3");
      heading.textContent = title;
      const paragraph = document.createElement("p");
      paragraph.textContent = body;
      article.append(heading, paragraph);
      if (extra) {
        const note = document.createElement("small");
        note.textContent = extra;
        article.append(note);
      }
      return article;
    };
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    renderList(
      "[data-prayer-section]", "[data-prayer-list]",
      prayerTimes.filter((entry) => entry.published && entry.date === today),
      (entry) => {
        const date = /^\d{4}-\d{2}-\d{2}$/.test(entry.date)
          ? new Intl.DateTimeFormat(isArabic ? "ar-KW" : isHindi ? "hi-IN" : "en-KW", { dateStyle: "long" })
            .format(new Date(`${entry.date}T12:00:00`))
          : entry.date;
        const names = isArabic
          ? ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"]
          : isHindi
            ? ["फ़ज्र", "ज़ुहर", "अस्र", "मग़रिब", "इशा"]
            : ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
        const times = [entry.fajr, entry.dhuhr, entry.asr, entry.maghrib, entry.isha];
        return card(date, names.map((name, index) => `${name}: ${times[index]}`).join(" · "),
          `${isArabic ? "المصدر" : isHindi ? "स्रोत" : "Source"}: ${localized(entry, "source")}`);
      }
    );
    renderList(
      "[data-ramadan-section]", "[data-ramadan-list]",
      ramadanGuidance.filter((entry) => entry.published),
      (entry) => card(localized(entry, "title"), localized(entry, "body"))
    );
    renderList(
      "[data-seasonal-alerts-section]", "[data-seasonal-alerts-list]",
      seasonalHealthAlerts.filter((entry) => entry.published &&
        (!entry.startDate || entry.startDate <= today) &&
        (!entry.endDate || entry.endDate >= today)),
      (entry) => card(localized(entry, "title"), localized(entry, "body"))
    );
  }

  let bmiEstimate = null;
  let dueDateEstimate = null;
  function renderCalculatorResults() {
    const isArabic = document.documentElement.lang === "ar";
    const isHindi = document.documentElement.lang === "hi";
    const formatNumber = (value, digits = 1) =>
      new Intl.NumberFormat(isArabic ? "ar-KW" : isHindi ? "hi-IN" : "en-KW", { maximumFractionDigits: digits }).format(value);
    const bmiElement = document.querySelector("[data-bmi-result]");
    if (bmiElement) {
      if (!bmiEstimate) bmiElement.textContent = "";
      else {
        const category = bmiEstimate.value < 18.5
          ? (isArabic ? "أقل من النطاق المرجعي للبالغين" : "Below the adult reference range")
          : bmiEstimate.value < 25
            ? (isArabic ? "ضمن النطاق المرجعي للبالغين" : "Within the adult reference range")
            : bmiEstimate.value < 30
              ? (isArabic ? "أعلى من النطاق المرجعي للبالغين" : "Above the adult reference range")
              : (isArabic ? "ضمن النطاق المرتفع للبالغين" : "In the higher adult range");
        bmiElement.textContent = isArabic
          ? `مؤشر كتلة الجسم التقديري: ${formatNumber(bmiEstimate.value)}. ${category}. هذا المؤشر وحده لا يقيّم الحالة الصحية.`
          : isHindi
            ? `अनुमानित BMI: ${formatNumber(bmiEstimate.value)}। ${bmiEstimate.value < 18.5 ? "वयस्क संदर्भ सीमा से कम" : bmiEstimate.value < 25 ? "वयस्क संदर्भ सीमा में" : bmiEstimate.value < 30 ? "वयस्क संदर्भ सीमा से अधिक" : "वयस्कों के लिए उच्च सीमा में"}। यह माप अकेले स्वास्थ्य का आकलन नहीं करता।`
            : `Estimated BMI: ${formatNumber(bmiEstimate.value)}. ${category}. This measure alone does not assess health.`;
      }
    }
    const dueDateElement = document.querySelector("[data-due-date-result]");
    if (dueDateElement) {
      dueDateElement.textContent = !dueDateEstimate ? "" : isArabic
        ? `موعد الولادة التقديري: ${new Intl.DateTimeFormat("ar-KW", { dateStyle: "long" }).format(dueDateEstimate)}. يرجى تأكيد الموعد مع مختص صحي.`
        : isHindi
          ? `अनुमानित प्रसव तिथि: ${new Intl.DateTimeFormat("hi-IN", { dateStyle: "long" }).format(dueDateEstimate)}। कृपया तारीख की पुष्टि स्वास्थ्य पेशेवर से करें।`
          : `Estimated due date: ${new Intl.DateTimeFormat("en-KW", { dateStyle: "long" }).format(dueDateEstimate)}. Please confirm dating with a healthcare professional.`;
    }
  }

  function setupHealthCalculators() {
    const bmiForm = document.querySelector("[data-bmi-form]");
    bmiForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!bmiForm.reportValidity()) return;
      const weight = Number(bmiForm.elements.weight.value);
      const height = Number(bmiForm.elements.height.value) / 100;
      bmiEstimate = { value: weight / (height * height) };
      renderCalculatorResults();
    });
    const dueDateForm = document.querySelector("[data-due-date-form]");
    const lastPeriodInput = dueDateForm?.elements.lmp;
    if (lastPeriodInput) {
      const today = new Date();
      lastPeriodInput.max = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    }
    dueDateForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!dueDateForm.reportValidity()) return;
      const [year, month, day] = dueDateForm.elements.lmp.value.split("-").map(Number);
      dueDateEstimate = new Date(year, month - 1, day);
      dueDateEstimate.setDate(dueDateEstimate.getDate() + 280);
      renderCalculatorResults();
    });
  }

  function renderBlog() {
    const content = document.querySelector("[data-blog-content]");
    const disabledNotice = document.querySelector("[data-blog-disabled]");
    const list = document.querySelector("[data-blog-list]");
    const empty = document.querySelector("[data-blog-empty]");
    if (!content || !disabledNotice || !list || !empty) return;

    content.hidden = !blogEnabled;
    disabledNotice.hidden = blogEnabled;
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.content = blogEnabled ? "index,follow" : "noindex,follow";
    if (!blogEnabled) return;

    const language = document.documentElement.lang;
    const isArabic = language === "ar";
    const isHindi = language === "hi";
    const localized = (post, field) => {
      const suffix = isArabic ? "Ar" : isHindi ? "Hi" : "";
      return post[`${field}${suffix}`] || post[field] || post[`${field}Ar`] || "";
    };
    const publishedPosts = blogPosts
      .filter((post) => post.published)
      .slice()
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    const categories = [...new Set(publishedPosts.map((post) => localized(post, "category")).filter(Boolean))];
    const categorySelect = document.querySelector("[data-blog-category]");
    const searchInput = document.querySelector("[data-blog-search]");
    if (categorySelect) {
      const previous = categorySelect.value;
      categorySelect.replaceChildren(new Option(t("All categories"), "all"),
        ...categories.map((category) => new Option(category, category)));
      categorySelect.value = categories.includes(previous) ? previous : "all";
    }
    const cards = publishedPosts.map((post, index) => {
      const article = document.createElement("article");
      article.className = "blog-card";
      const categoryText = localized(post, "category");
      article.dataset.category = categoryText;
      if (categoryText) {
        const category = document.createElement("p");
        category.className = "eyebrow";
        category.textContent = categoryText;
        article.append(category);
      }

      const title = document.createElement("h2");
      title.textContent = localized(post, "title");
      article.append(title);

      const date = document.createElement("time");
      const dateValue = new Date(`${post.date.slice(0, 10)}T00:00:00`);
      date.dateTime = post.date;
      date.textContent = Number.isNaN(dateValue.getTime())
        ? post.date
        : new Intl.DateTimeFormat(language === "ar" ? "ar-KW" : language === "hi" ? "hi-IN" : "en-KW", { dateStyle: "long" }).format(dateValue);
      article.append(date);

      const excerpt = document.createElement("p");
      excerpt.className = "blog-excerpt";
      excerpt.textContent = localized(post, "excerpt");
      article.append(excerpt);

      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = t("Read article");
      details.append(summary);
      const body = localized(post, "body");
      body.trim().split(/\n\s*\n/).filter(Boolean).forEach((block) => {
        const paragraph = document.createElement("p");
        block.split("\n").forEach((line, index) => {
          if (index) paragraph.append(document.createElement("br"));
          paragraph.append(document.createTextNode(line));
        });
        details.append(paragraph);
      });
      article.append(details);
      const actions = document.createElement("div");
      actions.className = "blog-actions";
      const shareButton = document.createElement("button");
      shareButton.className = "button button-secondary";
      shareButton.type = "button";
      shareButton.textContent = t("Share article");
      shareButton.setAttribute("aria-label", `${t("Share article")}: ${title.textContent}`);
      const status = document.createElement("span");
      status.className = "share-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      const articleUrl = new URL("blog.html", location.href);
      articleUrl.hash = `article-${encodeURIComponent(post.date.slice(0, 10))}-${index + 1}`;
      article.id = articleUrl.hash.slice(1);
      shareButton.addEventListener("click", () => shareOrCopy({
        title: title.textContent,
        text: excerpt.textContent,
        url: articleUrl.href,
        status
      }));
      actions.append(shareButton, status);
      article.append(actions);
      return article;
    });
    list.replaceChildren(...cards);
    const applyFilters = () => {
      const query = searchInput?.value.trim().toLocaleLowerCase() || "";
      const selectedCategory = categorySelect?.value || "all";
      let visibleCount = 0;
      cards.forEach((card) => {
        const matches = (selectedCategory === "all" || card.dataset.category === selectedCategory) &&
          card.textContent.toLocaleLowerCase().includes(query);
        card.hidden = !matches;
        if (matches) visibleCount += 1;
      });
      empty.hidden = visibleCount > 0;
      if (!publishedPosts.length) empty.textContent = t("There are no published articles yet.");
      else if (!visibleCount) empty.textContent = t("No articles match your search.");
    };
    if (searchInput && searchInput.dataset.filterBound !== "true") {
      searchInput.addEventListener("input", applyFilters);
      searchInput.dataset.filterBound = "true";
    }
    if (categorySelect && categorySelect.dataset.filterBound !== "true") {
      categorySelect.addEventListener("change", applyFilters);
      categorySelect.dataset.filterBound = "true";
    }
    applyFilters();
  }

  languageChangeCallbacks.push(
    renderServices, renderFaqs, renderTestimonials, renderHours,
    renderLocationDetails, renderServiceOptions, renderClinicBio, renderBlog,
    renderPatientInformation, renderCalculatorResults, renderManagedTools
  );
  renderManagedTools();
  setupHealthCalculators();
  const bookingLink = document.querySelector("[data-booking-link]");
  if (bookingLink) {
    let validBookingUrl = false;
    try {
      const parsedBookingUrl = new URL(bookingUrl);
      validBookingUrl = parsedBookingUrl.protocol === "https:";
      if (validBookingUrl) bookingLink.href = parsedBookingUrl.href;
    } catch (error) {
      if (bookingUrl.trim()) console.warn("The configured hosted booking URL is invalid.", error);
    }
    bookingLink.hidden = !validBookingUrl;
    bookingLink.closest("[data-live-booking]")?.toggleAttribute("hidden", !validBookingUrl);
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });
  let savedLanguage = "en";
  try {
    savedLanguage = localStorage.getItem(languageKey) || "en";
  } catch (error) {
    console.warn("Could not read the saved language preference.", error);
  }
  setLanguage(savedLanguage);

  const menu = document.querySelector(".primary-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const menuClose = document.querySelector(".menu-close");
  const menuIcons = new Map([
    ["index.html", "fa-house"],
    ["about.html", "fa-user-doctor"],
    ["services.html", "fa-stethoscope"],
    ["shop.html", "fa-bag-shopping"],
    ["appointment.html", "fa-calendar-check"],
    ["contact.html", "fa-message"],
    ["faq.html", "fa-circle-question"],
    ["blog.html", "fa-newspaper"],
    ["tools.html", "fa-calculator"]
  ]);
  if (menu) {
    const menuLanguageSwitch = menu.querySelector(".language-switch");
    const faqLink = menu.querySelector('a[href="faq.html"]');
    if (faqLink) {
      faqLink.dataset.en = "FAQ & Reviews";
      faqLink.dataset.ar = "الأسئلة الشائعة وآراء المرضى";
      faqLink.dataset.hi = "अक्सर पूछे जाने वाले प्रश्न और समीक्षाएँ";
      faqLink.textContent = t("FAQ & Reviews");
    }
    [
      ...(blogEnabled ? [
        { href: "blog.html", en: "Clinic Blog", ar: "مدونة العيادة", hi: "क्लिनिक ब्लॉग" }
      ] : []),
      { href: "tools.html", en: "Health Tools", ar: "الأدوات الصحية", hi: "स्वास्थ्य उपकरण" }
    ].forEach(({ href, en, ar, hi }) => {
      if (menu.querySelector(`a[href="${href}"]`)) return;
      const link = document.createElement("a");
      link.href = href;
      link.dataset.en = en;
      link.dataset.ar = ar;
      link.dataset.hi = hi;
      link.textContent = document.documentElement.lang === "ar" ? ar : document.documentElement.lang === "hi" ? hi : en;
      menu.insertBefore(link, menuLanguageSwitch);
    });
    const firstLink = menu.querySelector("a");
    const intro = document.createElement("div");
    intro.className = "menu-intro";
    intro.innerHTML = `
      <span class="menu-intro-icon"><i class="fa-solid fa-heart-pulse" aria-hidden="true"></i></span>
      <span><strong data-en="Your care, made simple" data-ar="رعايتك الصحية بكل سهولة">Your care, made simple</strong>
      <small data-en="Explore the clinic" data-ar="استكشف العيادة">Explore the clinic</small></span>`;
    intro.querySelectorAll("[data-en][data-ar]").forEach((element) => {
      element.textContent = document.documentElement.lang === "ar"
        ? element.dataset.ar
        : document.documentElement.lang === "hi"
          ? t(element.dataset.en)
          : element.dataset.en;
    });
    if (firstLink) menu.insertBefore(intro, firstLink);

    menu.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href");
      const icon = document.createElement("i");
      icon.className = `fa-solid ${menuIcons.get(href) || "fa-arrow-up-right-from-square"} nav-link-icon`;
      icon.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.className = "nav-link-label";
      label.textContent = link.textContent.trim();
      if (link.hasAttribute("data-en")) label.dataset.en = link.dataset.en;
      if (link.hasAttribute("data-ar")) label.dataset.ar = link.dataset.ar;
      link.removeAttribute("data-en");
      link.removeAttribute("data-ar");
      link.replaceChildren(icon, label);
      if (link.getAttribute("aria-current") === "page") {
        const current = document.createElement("i");
        current.className = "fa-solid fa-circle-check nav-current-icon";
        current.setAttribute("aria-hidden", "true");
        link.append(current);
      }
    });

    const desktopQuickNav = document.createElement("nav");
    desktopQuickNav.className = "desktop-quick-nav";
    desktopQuickNav.setAttribute("aria-label", t("Quick navigation"));
    const desktopLinks = [
      { href: "index.html", en: "Home", ar: "الرئيسية", icon: "fa-house" },
      { href: "services.html", en: "Services", ar: "الخدمات", icon: "fa-stethoscope" },
      { href: "shop.html", en: "Shop", ar: "المتجر", icon: "fa-bag-shopping" },
      { href: "appointment.html", en: "Book", ar: "احجز", icon: "fa-calendar-check" },
      { href: "contact.html", en: "Contact", ar: "اتصل بنا", icon: "fa-message" }
    ];
    desktopLinks.forEach(({ href, en, ar, icon }) => {
      const link = document.createElement("a");
      link.href = href;
      link.setAttribute("aria-label", t(en));
      if (href === currentPage) link.setAttribute("aria-current", "page");
      const iconElement = document.createElement("i");
      iconElement.className = `fa-solid ${icon}`;
      iconElement.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.dataset.en = en;
      label.dataset.ar = ar;
      label.textContent = document.documentElement.lang === "ar" ? ar : en;
      link.append(iconElement, label);
      desktopQuickNav.append(link);
    });
    menuToggle?.before(desktopQuickNav);
    const updateDesktopQuickNav = () => {
      desktopQuickNav.setAttribute("aria-label", t("Quick navigation"));
      desktopQuickNav.querySelectorAll("a").forEach((link) => {
        const label = link.querySelector("span");
        if (label) link.setAttribute("aria-label", label.textContent);
      });
    };
    languageChangeCallbacks.push(updateDesktopQuickNav);

    const themeToggle = document.createElement("button");
    themeToggle.className = "theme-toggle";
    themeToggle.type = "button";
    themeToggle.innerHTML = '<i class="fa-solid" aria-hidden="true"></i>';
    const languageSwitch = menu.querySelector(".language-switch");
    if (languageSwitch) languageSwitch.after(themeToggle);
    const updateThemeToggle = () => {
      const isDark = document.documentElement.dataset.theme === "dark";
      const label = t(isDark ? "Switch to light mode" : "Switch to dark mode");
      themeToggle.setAttribute("aria-label", label);
      themeToggle.title = label;
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.querySelector("i").className = `fa-solid ${isDark ? "fa-sun" : "fa-moon"}`;
    };
    themeToggle.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      try {
        localStorage.setItem(themeKey, nextTheme);
      } catch (error) {
        console.warn("Could not save the theme preference.", error);
      }
      updateThemeToggle();
    });
    languageChangeCallbacks.push(updateThemeToggle);
    updateThemeToggle();
  }
  {
  }
  const menuBackdrop = document.createElement("button");
  menuBackdrop.className = "menu-backdrop";
  menuBackdrop.type = "button";
  menuBackdrop.setAttribute("aria-label", t("Close navigation menu"));
  menuBackdrop.hidden = true;
  document.body.append(menuBackdrop);
  function toggleMenu(open) {
    if (!menu || !menuToggle) return;
    menu.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", t(open ? "Close menu" : "Open menu"));
    document.body.classList.toggle("menu-open", open);
    menuBackdrop.hidden = !open;
    const mobileMenu = window.matchMedia("(max-width: 767px)").matches;
    menu.inert = mobileMenu && !open;
    menu.setAttribute("aria-hidden", String(mobileMenu && !open));
    menuToggle.setAttribute("aria-controls", menu.id || "primary-navigation");
    if (!menu.id) menu.id = "primary-navigation";
    if (open) menuClose?.focus();
    else menuToggle.focus();
  }
  if (menu) {
    const mobileMenu = window.matchMedia("(max-width: 767px)");
    const syncMenuAccessibility = () => {
      const closed = mobileMenu.matches && !menu.classList.contains("is-open");
      menu.inert = closed;
      menu.setAttribute("aria-hidden", String(closed));
      if (menuToggle) menuToggle.setAttribute("aria-controls", menu.id || "primary-navigation");
      if (!menu.id) menu.id = "primary-navigation";
    };
    syncMenuAccessibility();
    mobileMenu.addEventListener("change", syncMenuAccessibility);
  }
  menuToggle?.addEventListener("click", () => toggleMenu(!menu?.classList.contains("is-open")));
  menuClose?.addEventListener("click", () => toggleMenu(false));
  menuBackdrop.addEventListener("click", () => toggleMenu(false));
  menu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu?.classList.contains("is-open")) toggleMenu(false);
    if (event.key !== "Tab" || !menu?.classList.contains("is-open")) return;
    const focusable = [...menu.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')]
      .filter((element) => !element.hidden && !element.closest("[hidden]"));
    if (!focusable.length) {
      event.preventDefault();
      menuClose?.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === menu)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.querySelectorAll('a[href="shop.html"]').forEach((link) => {
    if (!shopEnabled) {
      if (link.parentElement?.tagName === "LI") link.parentElement.hidden = true;
      else link.hidden = true;
    }
  });
  document.querySelectorAll("[data-shop-section]").forEach((section) => {
    section.hidden = !shopEnabled;
  });
  document.querySelectorAll("[data-shop-disabled]").forEach((section) => {
    section.hidden = shopEnabled;
  });

  const cartKey = "doctor-clinic-cart";
  let cart = [];
  function isValidCartItem(item) {
    return item && typeof item.name === "string" &&
      Number.isInteger(item.quantity) && item.quantity > 0 &&
      products.some((product) => product.name === item.name && product.inStock);
  }
  try {
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (!Array.isArray(parsedCart)) throw new Error("Saved cart is not an array.");
      cart = parsedCart.filter(isValidCartItem);
      if (cart.length !== parsedCart.length) {
        console.warn("Removed invalid or unavailable products from the saved cart.");
      }
    }
  } catch (error) {
    console.error("Could not restore the saved cart.", error);
  }

  function saveCart() {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch (error) {
      console.error("Could not save the cart in this browser.", error);
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function renderCart() {
    const container = document.querySelector("[data-cart-items]");
    if (!container) return;
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => {
      const product = products.find((entry) => entry.name === item.name);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    const countElement = document.querySelector("[data-cart-count]");
    const totalElement = document.querySelector("[data-cart-total]");
    const orderLink = document.querySelector("[data-cart-order]");
    if (countElement) countElement.textContent = String(count);
    if (totalElement) totalElement.textContent = `${Number(total.toFixed(3))} KWD`;
    const dockCount = document.querySelector("[data-dock-cart-count]");
    if (dockCount) {
      dockCount.textContent = String(count);
      dockCount.hidden = count === 0;
    }

    container.innerHTML = cart.length
      ? cart.map((item) => {
        const index = products.findIndex((product) => product.name === item.name);
        const product = products[index];
        return `<div class="cart-item">
          <span class="cart-item-name">${escapeHtml(t(product.name))} <small>${product.price} KWD ${escapeHtml(t("each"))}</small></span>
          <div class="cart-item-controls" role="group" aria-label="${escapeHtml(t(product.name))} ${escapeHtml(t("quantity"))}">
            <button type="button" data-cart-action="decrease" data-cart-index="${index}" aria-label="${escapeHtml(t("Decrease"))} ${escapeHtml(t(product.name))} ${escapeHtml(t("quantity"))}">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-action="increase" data-cart-index="${index}" aria-label="${escapeHtml(t("Increase"))} ${escapeHtml(t(product.name))} ${escapeHtml(t("quantity"))}">+</button>
            <button type="button" data-cart-action="remove" data-cart-index="${index}" aria-label="${escapeHtml(t("Remove"))} ${escapeHtml(t(product.name))} ${escapeHtml(t("from cart"))}">${escapeHtml(t("Remove"))}</button>
          </div>
        </div>`;
      }).join("")
      : `<p class="cart-empty">${escapeHtml(t("Your cart is empty."))}</p>`;

    const phoneDigits = doctorInfo.whatsapp.replace(/\D/g, "");
    if (orderLink) {
      const orderText = [
        `${t("Hello")} ${doctorInfo.name} — ${t("Clinic product order")}`,
        ...cart.map((item) => {
          const product = products.find((entry) => entry.name === item.name);
          return product ? `${item.quantity} × ${t(product.name)} — ${product.price} KWD ${t("each")} (${Number((product.price * item.quantity).toFixed(3))} KWD)` : "";
        }).filter(Boolean),
        `${t("Estimated items total:")} ${Number(total.toFixed(3))} KWD`,
        t("Please confirm stock, final pricing, and collection or delivery. No payment has been made.")
      ].join("\n");
      const canOrder = cart.length > 0 && phoneDigits.length > 3;
      orderLink.href = canOrder
        ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(orderText)}`
        : "#";
      orderLink.toggleAttribute("aria-disabled", !canOrder);
      orderLink.classList.toggle("button-disabled", !canOrder);
      if (canOrder) {
        orderLink.target = "_blank";
        orderLink.rel = "noopener noreferrer";
        orderLink.removeAttribute("tabindex");
      } else {
        orderLink.removeAttribute("target");
        orderLink.removeAttribute("rel");
        orderLink.tabIndex = -1;
      }
    }
  }

  function addToCart(product) {
    const existingItem = cart.find((item) => item.name === product.name);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ name: product.name, quantity: 1 });
    saveCart();
    renderCart();
  }

  function productCard(product, index, featuredOnly) {
    const localizedName = document.documentElement.lang === "hi"
      ? (product.nameHi || t(product.name))
      : t(product.name);
    const localizedDescription = document.documentElement.lang === "hi"
      ? (product.descriptionHi || t(product.description))
      : t(product.description);
    const stockStatus = `<span class="stock-badge${product.inStock ? " in-stock" : ""}">${escapeHtml(t(product.inStock ? "In Stock" : "Out of Stock"))}</span>`;
    const action = featuredOnly
      ? `<a class="button button-secondary" href="shop.html">${escapeHtml(t("View in Shop"))}</a>`
      : `<button class="button button-primary${product.inStock ? "" : " button-disabled"}" type="button" data-add-to-cart="${index}"${product.inStock ? "" : " disabled"}>${escapeHtml(t(product.inStock ? "Add to Cart" : "Currently unavailable"))}</button>`;
    const paymentUrl = paymentLinks.enabled && validMyFatoorahUrl(product.paymentLink)
      ? `<a class="button button-secondary payment-link" href="${escapeHtml(product.paymentLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("Pay online with myFatoorah"))}</a>`
      : "";
    return `<article class="product-card">
      <div class="product-image">${stockStatus}<img src="${escapeHtml(product.image)}" alt="${escapeHtml(localizedName)}" loading="lazy"></div>
      <div class="product-card-body"><p class="eyebrow">${escapeHtml(t(product.category))}</p>
        <h3>${escapeHtml(localizedName)}</h3><p>${escapeHtml(localizedDescription)}</p>
        <p class="product-price">${product.price} KWD</p>
        ${action}
        ${paymentUrl}
      </div></article>`;
  }

  document.querySelectorAll("[data-product-list]").forEach((container) => {
    const featuredOnly = container.dataset.productList === "featured";
    let currentCategory = "all";
    const render = () => {
      const search = document.querySelector("[data-product-search]")?.value.trim().toLocaleLowerCase() || "";
      const inStockOnly = Boolean(document.querySelector("[data-in-stock-only]")?.checked);
      const filtered = products.filter((product) =>
        (!featuredOnly || product.featured) &&
        (currentCategory === "all" || product.category === currentCategory) &&
        (!inStockOnly || product.inStock) &&
        (!search || `${product.name} ${product.description} ${product.category} ${product.nameHi || ""} ${product.descriptionHi || ""}`.toLocaleLowerCase().includes(search))
      );
      container.innerHTML = filtered.map((product) =>
        productCard(product, products.indexOf(product), featuredOnly)
      ).join("");
      const emptyMessage = document.querySelector("[data-products-empty]");
      if (emptyMessage) emptyMessage.hidden = filtered.length > 0;
      const resultCount = document.querySelector("[data-product-count]");
      if (resultCount) resultCount.textContent = `${filtered.length} ${t("products found")}`;
    };
    languageChangeCallbacks.push(() => render());
    if (shopEnabled) render();
    if (!featuredOnly && shopEnabled) {
      document.querySelectorAll("[data-category]").forEach((button) => {
        button.addEventListener("click", () => {
          document.querySelectorAll("[data-category]").forEach((item) => {
            item.classList.toggle("is-active", item === button);
            item.setAttribute("aria-pressed", String(item === button));
          });
          currentCategory = button.dataset.category;
          render();
        });
      });
      document.querySelector("[data-product-search]")?.addEventListener("input", render);
      document.querySelector("[data-in-stock-only]")?.addEventListener("change", render);
      container.addEventListener("click", (event) => {
        const button = event.target.closest("[data-add-to-cart]");
        if (!button) return;
        const product = products[Number(button.dataset.addToCart)];
        if (product?.inStock) addToCart(product);
      });
    }
  });
  renderCart();

  document.querySelector("[data-cart-items]")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;
    if (button.dataset.cartAction === "clear") {
      cart = [];
      saveCart();
      renderCart();
      return;
    }
    const product = products[Number(button.dataset.cartIndex)];
    const item = cart.find((entry) => entry.name === product?.name);
    if (!item) return;
    if (button.dataset.cartAction === "increase") item.quantity += 1;
    else if (button.dataset.cartAction === "decrease") item.quantity -= 1;
    else if (button.dataset.cartAction === "remove") item.quantity = 0;
    cart = cart.filter((entry) => entry.quantity > 0);
    saveCart();
    renderCart();
  });

  document.querySelectorAll(".contact-form").forEach((form) => {
    let validationAttempted = false;
    const summary = document.createElement("div");
    summary.className = "form-error-summary";
    summary.setAttribute("role", "alert");
    summary.tabIndex = -1;
    summary.hidden = true;
    form.insertBefore(summary, form.querySelector("button[type='submit']"));

    const updateValidation = (focusSummary = false) => {
      const invalidFields = [...form.elements].filter((field) =>
        field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement
      ).filter((field) => !field.checkValidity() && field.type !== "hidden");
      invalidFields.forEach((field) => {
        field.setAttribute("aria-invalid", "true");
        let error = form.querySelector(`#${CSS.escape(`${form.id || form.name}-${field.name}-error`)}`);
        if (!error) {
          error = document.createElement("span");
          error.className = "field-error";
          error.id = `${form.id || form.name}-${field.name}-error`;
          field.insertAdjacentElement("afterend", error);
        }
        error.textContent = field.validity.valueMissing ? t("This field is required.") : t("Enter a valid value.");
        field.setAttribute("aria-describedby", [field.getAttribute("aria-describedby"), error.id].filter(Boolean).join(" "));
      });
      form.querySelectorAll("[aria-invalid='true']").forEach((field) => {
        if (invalidFields.includes(field)) return;
        field.removeAttribute("aria-invalid");
        const id = `${form.id || form.name}-${field.name}-error`;
        form.querySelector(`#${CSS.escape(id)}`)?.remove();
        field.removeAttribute("aria-describedby");
      });
      summary.hidden = invalidFields.length === 0;
      summary.replaceChildren();
      if (invalidFields.length) {
        const heading = document.createElement("p");
        heading.textContent = t("Please correct the following fields:");
        const list = document.createElement("ul");
        invalidFields.forEach((field) => {
          const item = document.createElement("li");
          const label = form.querySelector(`label[for="${CSS.escape(field.id)}"]`);
          const labelCopy = label?.cloneNode(true);
          labelCopy?.querySelectorAll("input, select, textarea, .field-required, .field-error").forEach((element) => element.remove());
          item.textContent = labelCopy?.textContent.trim() || field.name;
          list.append(item);
        });
        summary.append(heading, list);
      }
      if (focusSummary && invalidFields.length) summary.focus();
      return invalidFields.length === 0;
    };

    form.addEventListener("invalid", (event) => {
      const firstInvalid = [...form.elements].find((field) => field.willValidate && !field.validity.valid);
      if (event.target !== firstInvalid) return;
      event.preventDefault();
      validationAttempted = true;
      updateValidation(true);
    }, true);
    form.addEventListener("submit", (event) => {
      validationAttempted = true;
      if (!updateValidation(true)) event.preventDefault();
    });
    form.addEventListener("input", () => {
      if (validationAttempted) updateValidation();
    });
    form.addEventListener("change", () => {
      if (validationAttempted) updateValidation();
    });
  });

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
  languageChangeCallbacks.push(() => renderCart());
  document.querySelectorAll("[data-dock-shop]").forEach((link) => {
    link.hidden = !shopEnabled;
  });

  const query = new URLSearchParams(window.location.search);
  const appointmentForm = document.querySelector("[data-appointment-form]");
  const appointmentService = document.querySelector("#appointment-service");
  const requestedService = query.get("service");
  if (appointmentForm && appointmentService && requestedService) {
    const translatedRequest = arabicTranslations[requestedService];
    const matchingOption = [...appointmentService.options].find((option) =>
      option.value === requestedService ||
      option.textContent === requestedService ||
      option.textContent === translatedRequest
    );
    if (matchingOption) appointmentService.value = matchingOption.value;
  }

  if (query.get("submitted") === "true") {
    document.querySelectorAll("[data-form-success]").forEach((message) => {
      message.hidden = false;
    });
    document.querySelectorAll("#contact-form, [data-appointment-form]").forEach((form) => {
      form.hidden = true;
    });
  }
}).catch((error) => {
  console.error("Could not initialize the clinic website.", error);
  const message = document.createElement("p");
  message.className = "site-config-error";
  message.setAttribute("role", "alert");
  message.textContent = "The clinic website could not be initialized. Please try again later.";
  document.body.prepend(message);
});
