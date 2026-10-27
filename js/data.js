window.siteDataReady = fetch("js/site-config.json", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error(`Site settings request failed (${response.status}).`);
    return response.json();
  })
  .then((config) => {
    config.bookingUrl ??= "";
    config.paymentLinks ??= { enabled: false };
    config.emergencyInfo ??= {};
    ["emergencyNumber", "emergencyNumberAr", "emergencyMessage", "emergencyMessageAr", "emergencyMessageHi"]
      .forEach((field) => { config.emergencyInfo[field] ??= ""; });
    config.firstAidSections ??= [];
    config.preparationGuides ??= [];
    config.vaccinationSchedule ??= [];
    config.prayerTimes ??= [];
    config.ramadanGuidance ??= [];
    config.seasonalHealthAlerts ??= [];
    config.seasonalHealthAlerts.forEach((alert) => {
      alert.startDate ??= "";
      alert.endDate ??= "";
    });
    config.blogEnabled ??= true;
    config.blogPosts ??= [];
    config.blogPosts.forEach((post) => {
      post.category ??= "";
      post.categoryAr ??= "";
      ["titleHi", "excerptHi", "bodyHi", "categoryHi"].forEach((field) => { post[field] ??= ""; });
    });
    config.cloudflareWebAnalyticsToken ??= "";
    config.introVideoUrl ??= "";
    if (config?.doctorInfo) {
      config.doctorInfo.bio ??= "";
      config.doctorInfo.bioAr ??= "";
      ["specialtyHi", "bioHi", "directionsUrl", "parking", "parkingAr", "parkingHi", "accessibility", "accessibilityAr", "accessibilityHi", "googleBusinessProfile"]
        .forEach((field) => { config.doctorInfo[field] ??= ""; });
      config.doctorInfo.socialProfiles ??= {};
      ["instagram", "facebook", "linkedin"]
        .forEach((field) => { config.doctorInfo.socialProfiles[field] ??= ""; });
    }
    config?.services?.forEach((service) => {
      service.details ??= [];
      service.detailsAr ??= [];
      service.detailsHi ??= [];
      service.paymentLink ??= "";
      ["nameHi", "descriptionHi", "durationHi", "feeHi"]
        .forEach((field) => { service[field] ??= ""; });
      ["duration", "durationAr", "fee", "feeAr", "icon"]
        .forEach((field) => { service[field] ??= field === "icon" ? "fa-stethoscope" : ""; });
    });
    config?.testimonials?.forEach((testimonial) => {
      testimonial.quoteAr ??= "";
      testimonial.quoteHi ??= "";
      testimonial.image ??= "";
    });
    config?.faqs?.forEach((faq) => {
      ["categoryHi", "questionHi", "answerHi"].forEach((field) => { faq[field] ??= ""; });
    });
    const validCategories = new Set(["Medicines", "Supplements", "Medical Devices"]);
    const doctorFields = [
      "name", "specialty", "bio", "bioAr", "phone", "email", "whatsapp", "address", "googleMapsEmbed",
      "directionsUrl", "parking", "parkingAr", "accessibility", "accessibilityAr", "googleBusinessProfile"
    ];
    const bilingualRecord = (record, fields) => fields.every((field) =>
      typeof record?.[field] === "string" && record[field].trim().length > 0
    );
    const validPaymentUrl = (value) => {
      if (typeof value !== "string" || !value.trim()) return value === "";
      try {
        const url = new URL(value);
        return url.protocol === "https:" &&
          (url.hostname === "myfatoorah.com" || url.hostname.endsWith(".myfatoorah.com"));
      } catch {
        return false;
      }
    };
    const validDate = (value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day;
    };
    if (
      !config || typeof config.shopEnabled !== "boolean" ||
      typeof config.blogEnabled !== "boolean" ||
      !Array.isArray(config.blogPosts) ||
      !["emergencyNumber", "emergencyNumberAr", "emergencyMessage", "emergencyMessageAr"]
        .every((field) => typeof config.emergencyInfo?.[field] === "string") ||
      !Array.isArray(config.firstAidSections) ||
      !config.firstAidSections.every((section) =>
        bilingualRecord(section, ["title", "titleAr", "body", "bodyAr"]) &&
        typeof section.enabled === "boolean"
      ) ||
      !Array.isArray(config.preparationGuides) ||
      !config.preparationGuides.every((guide) =>
        bilingualRecord(guide, ["title", "titleAr", "body", "bodyAr"]) &&
        typeof guide.published === "boolean"
      ) ||
      !Array.isArray(config.vaccinationSchedule) ||
      !config.vaccinationSchedule.every((entry) =>
        bilingualRecord(entry, ["ageGroup", "vaccine", "vaccineAr", "details", "detailsAr"]) &&
        typeof entry.published === "boolean"
      ) ||
      !Array.isArray(config.prayerTimes) ||
      !config.prayerTimes.every((entry) =>
        validDate(entry.date) &&
        ["fajr", "dhuhr", "asr", "maghrib", "isha"].every((field) =>
          typeof entry[field] === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(entry[field])
        ) &&
        typeof entry.source === "string" &&
        typeof entry.published === "boolean"
      ) ||
      !Array.isArray(config.ramadanGuidance) ||
      !config.ramadanGuidance.every((entry) =>
        bilingualRecord(entry, ["title", "titleAr", "body", "bodyAr"]) &&
        typeof entry.published === "boolean"
      ) ||
      !Array.isArray(config.seasonalHealthAlerts) ||
      !config.seasonalHealthAlerts.every((entry) =>
        bilingualRecord(entry, ["title", "titleAr", "body", "bodyAr"]) &&
        typeof entry.startDate === "string" && typeof entry.endDate === "string" &&
        (!entry.startDate || validDate(entry.startDate)) &&
        (!entry.endDate || validDate(entry.endDate)) &&
        (!entry.startDate || !entry.endDate || entry.startDate <= entry.endDate) &&
        typeof entry.published === "boolean"
      ) ||
      !config.blogPosts.every((post) =>
        post && ["title", "titleAr", "excerpt", "excerptAr", "body", "bodyAr", "date", "category", "categoryAr"]
          .every((field) => typeof post[field] === "string") &&
        typeof post.published === "boolean"
      ) ||
      typeof config.bookingUrl !== "string" ||
      !config.paymentLinks || typeof config.paymentLinks.enabled !== "boolean" ||
      typeof config.cloudflareWebAnalyticsToken !== "string" ||
      typeof config.introVideoUrl !== "string" ||
      !doctorFields.every((field) => typeof config.doctorInfo?.[field] === "string") ||
      !["instagram", "facebook", "linkedin"].every((field) =>
        typeof config.doctorInfo?.socialProfiles?.[field] === "string"
      ) ||
      !Array.isArray(config.products) ||
      !config.products.every((product) =>
        product && typeof product.name === "string" &&
        typeof product.description === "string" &&
        Number.isFinite(product.price) && product.price >= 0 &&
        typeof product.image === "string" &&
        (product.paymentLink === undefined || validPaymentUrl(product.paymentLink)) &&
        validCategories.has(product.category) &&
        typeof product.featured === "boolean" &&
        typeof product.inStock === "boolean"
      ) ||
      !Array.isArray(config.services) ||
      !config.services.every((service) =>
        bilingualRecord(service, ["name", "nameAr", "description", "descriptionAr"]) &&
        Array.isArray(service.details) && Array.isArray(service.detailsAr) &&
        service.details.every((detail) => typeof detail === "string") &&
        service.detailsAr.every((detail) => typeof detail === "string") &&
        typeof service.paymentLink === "string" && validPaymentUrl(service.paymentLink) &&
        typeof service.enabled === "boolean"
      ) ||
      !Array.isArray(config.hours) ||
      !config.hours.every((row) =>
        bilingualRecord(row, ["day", "dayAr", "hours", "hoursAr"])
      ) ||
      !Array.isArray(config.faqs) ||
      !config.faqs.every((faq) =>
        bilingualRecord(faq, ["category", "categoryAr", "question", "questionAr", "answer", "answerAr"]) &&
        typeof faq.enabled === "boolean"
      ) ||
      !Array.isArray(config.testimonials) ||
      !config.testimonials.every((testimonial) =>
        bilingualRecord(testimonial, ["name", "quote"]) &&
        typeof testimonial.quoteAr === "string" &&
        typeof testimonial.approved === "boolean" &&
        typeof testimonial.consentConfirmed === "boolean" &&
        (testimonial.image === undefined || typeof testimonial.image === "string")
      )
    ) {
      throw new Error("Site settings contain invalid clinic or product data.");
    }
    return config;
  });

const arabicTranslations = {
  "Skip to content": "انتقل إلى المحتوى",
  "JavaScript is required for product listings and the language selector.": "يلزم تفعيل JavaScript لعرض المنتجات واستخدام محدد اللغة.",
  "Dr. [Name]": "د. [Name]",
  "Dr. [Name] Clinic": "عيادة د. [Name]",
  "[Full clinic address, Kuwait]": "[عنوان العيادة الكامل، الكويت]",
  "[PHONE]": "[رقم الهاتف]",
  "[Specialty]": "[التخصص]",
  "Main navigation": "القائمة الرئيسية",
  "Your care, made simple": "رعايتك الصحية بكل سهولة",
  "Explore the clinic": "استكشف العيادة",
  "Close navigation menu": "إغلاق قائمة التنقل",
  "Close menu": "إغلاق القائمة",
  "Open menu": "فتح القائمة",
  "Switch to dark mode": "التبديل إلى الوضع الداكن",
  "Switch to light mode": "التبديل إلى الوضع الفاتح",
  "Get Directions": "احصل على الاتجاهات",
  "Open in Waze": "افتح في Waze",
  "Check live availability": "تحقق من المواعيد المتاحة",
  "Choose an available time in the clinic's hosted booking calendar.": "اختر وقتاً متاحاً من تقويم المواعيد المستضاف للعيادة.",
  "Open live booking calendar": "افتح تقويم المواعيد",
  "Introduction video for the clinic": "الفيديو التعريفي للعيادة",
  "Blog": "المدونة",
  "Read article": "اقرأ المقال",
  "Language": "اللغة",
  "Quick navigation": "تنقل سريع",
  "All Products": "جميع المنتجات",
  "Search products": "ابحث عن المنتجات",
  "In-stock products only": "المنتجات المتوفرة فقط",
  "products found": "منتجات",
  "In Stock": "متوفر",
  "Clear cart": "إفراغ السلة",
  "Estimated items total:": "إجمالي المنتجات التقديري:",
  "Clinic product order": "طلب منتجات من العيادة",
  "Please confirm stock, final pricing, and collection or delivery. No payment has been made.": "يرجى تأكيد المخزون والسعر النهائي والاستلام أو التوصيل. لم يتم الدفع.",
  "No products match your search or filters.": "لا توجد منتجات تطابق البحث أو عوامل التصفية.",
  "Typical duration:": "المدة المعتادة:",
  "Fee:": "الرسوم:",
  "Parking": "مواقف السيارات",
  "Accessibility": "إمكانية الوصول",
  "Get Directions": "احصل على الاتجاهات",
  "Verified Google Business Profile": "الملف التجاري الرسمي على Google",
  "View verified Google profile": "عرض الملف الرسمي على Google",
  "This field is required.": "هذا الحقل مطلوب.",
  "Enter a valid value.": "أدخل قيمة صحيحة.",
  "Please correct the following fields:": "يرجى تصحيح الحقول التالية:",
  "Hours": "ساعات العمل",
  "Medicines": "الأدوية",
  "Supplements": "المكملات الغذائية",
  "Medical Devices": "الأجهزة الطبية",
  "Home": "الرئيسية",
  "About": "عن الطبيب",
  "Services": "الخدمات",
  "Shop": "المتجر",
  "Appointment": "المواعيد",
  "Contact": "اتصل بنا",
  "FAQ": "الأسئلة الشائعة",
  "Reviews": "آراء المرضى",
  "Clinic": "العيادة",
  "Quick Links": "روابط سريعة",
  "Hours:": "ساعات العمل:",
  "Sun–Thu: 8 AM–8 PM": "الأحد–الخميس: ٨ صباحاً–٨ مساءً",
  "Fri–Sat: Closed": "الجمعة–السبت: مغلق",
  "Sun–Thu": "الأحد–الخميس",
  "Fri–Sat": "الجمعة–السبت",
  "Closed": "مغلق",
  "8 AM–8 PM": "٨ صباحاً–٨ مساءً",
  "Do not fill this out:": "لا تملأ هذا الحقل:",
  "For emergencies, call 112 or visit the nearest hospital.": "للطوارئ، اتصل بالرقم 112 أو توجّه إلى أقرب مستشفى.",
  "For emergencies, call 112 or visit the nearest hospital. This website is not monitored for emergencies.": "للطوارئ، اتصل بالرقم 112 أو توجّه إلى أقرب مستشفى. لا تتم مراقبة هذا الموقع للحالات الطارئة.",
  "Care you can count on": "رعاية صحية يمكنك الوثوق بها",
  "Dr. [Name], [Specialty] Specialist": "د. [Name]، اختصاصي [Specialty]",
  "Personal, professional healthcare for you and your family in Kuwait. Replace this text with the doctor's verified biography and experience.": "رعاية صحية شخصية ومهنية لك ولعائلتك في الكويت. استبدل هذا النص بالسيرة الذاتية والخبرة الموثقتين للطبيب.",
  "Book an Appointment": "احجز موعداً",
  "Chat on WhatsApp": "تواصل عبر واتساب",
  "Clinic highlights": "مميزات العيادة",
  "MOH credentials — add verified details": "اعتمادات وزارة الصحة — أضف التفاصيل الموثقة",
  "Google rating — replace with verified rating": "تقييم Google — استبدله بالتقييم الموثق",
  "Patient care — add verified clinic statistics": "رعاية المرضى — أضف إحصاءات العيادة الموثقة",
  "How we can help": "كيف يمكننا مساعدتك",
  "Our Services": "خدماتنا",
  "A selection of clinic services. Confirm availability, fees and insurance coverage with the clinic.": "مجموعة من خدمات العيادة. يرجى التأكد من التوفر والرسوم والتغطية التأمينية مع العيادة.",
  "General Consultation": "استشارة عامة",
  "Discuss your health concerns and care options with the doctor.": "ناقش مخاوفك الصحية وخيارات الرعاية مع الطبيب.",
  "Diagnostic Testing": "الفحوصات التشخيصية",
  "Ask the clinic about available tests and preparation instructions.": "استفسر من العيادة عن الفحوصات المتاحة وتعليمات التحضير.",
  "Telemedicine": "الاستشارات عن بُعد",
  "Remote appointments may be available for suitable concerns.": "قد تتوفر مواعيد عن بُعد لبعض الحالات المناسبة.",
  "View all services": "عرض جميع الخدمات",
  "Clinic recommendations": "منتجات العيادة",
  "Recommended Products": "المنتجات الموصى بها",
  "Product information is illustrative. Consult a qualified healthcare professional before using any medicine or supplement.": "معلومات المنتجات توضيحية. استشر مختصاً صحياً مؤهلاً قبل استخدام أي دواء أو مكمل غذائي.",
  "Patient experiences": "تجارب المرضى",
  "Patient Testimonials": "آراء المرضى",
  "Replace these sample cards with testimonials approved by the patients and clinic.": "استبدل هذه البطاقات التجريبية بآراء معتمدة من المرضى والعيادة.",
  "[Add an approved patient testimonial here.]": "[أضف هنا شهادة مريض معتمدة.]",
  "[Patient name — use with consent]": "[اسم المريض — يُستخدم بعد الحصول على الموافقة]",
  "Ready to Book Your Appointment?": "هل أنت مستعد لحجز موعدك؟",
  "Contact the clinic to ask about appointment availability.": "تواصل مع العيادة للاستفسار عن المواعيد المتاحة.",
  "Book Now": "احجز الآن",
  "All rights reserved.": "جميع الحقوق محفوظة.",
  "Meet your doctor": "تعرف على طبيبك",
  "About Dr. [Name]": "عن د. [الاسم]",
  "Learn about the doctor's background, approach and qualifications. Replace placeholders with verified information.": "تعرف على خلفية الطبيب ونهجه ومؤهلاته. استبدل النصوص المؤقتة بمعلومات موثقة.",
  "Add a clinic-approved biography describing the doctor's training, areas of practice, and approach to patient care. Do not include unverified credentials or outcome claims.": "أضف نبذة معتمدة من العيادة عن تدريب الطبيب ومجالات ممارسته ونهجه في رعاية المرضى. لا تدرج مؤهلات أو ادعاءات نتائج غير مؤكدة.",
  "Include relevant experience and languages spoken, after confirming each detail. Explain what patients can expect during a visit.": "أدرج الخبرة ذات الصلة واللغات التي يتحدث بها الطبيب بعد التحقق من كل معلومة. وضح ما يمكن للمرضى توقعه أثناء الزيارة.",
  "Years experience*": "سنوات الخبرة*",
  "Patients treated*": "مريضاً تمت رعايتهم*",
  "Families cared for*": "عائلة تمت رعايتها*",
  "*Example figures — verify or remove before publishing.": "*أرقام تجريبية — تحقق منها أو احذفها قبل النشر.",
  "Education & Certifications": "التعليم والشهادات",
  "Replace each sample with verified qualification details.": "استبدل كل مثال بتفاصيل مؤهلات موثقة.",
  "[Degree or qualification]": "[الدرجة العلمية أو المؤهل]",
  "[Institution] · [Year]": "[المؤسسة] · [السنة]",
  "[Board certification]": "[شهادة البورد]",
  "[Certifying body] · [Year]": "[جهة الاعتماد] · [السنة]",
  "[Additional training]": "[تدريب إضافي]",
  "Professional Memberships": "العضويات المهنية",
  "List memberships only when confirmed and current.": "أدرج العضويات بعد التأكد من أنها سارية ومحدثة.",
  "[Professional association]": "[الجمعية المهنية]",
  "[Membership status / dates]": "[حالة العضوية / التواريخ]",
  "[Medical society]": "[الجمعية الطبية]",
  "[Other membership]": "[عضوية أخرى]",
  "Meet Dr. [Name]": "تعرف على د. [الاسم]",
  "Add the clinic's approved introduction video.": "أضف الفيديو التعريفي المعتمد من العيادة.",
  "Replace VIDEO_ID with the approved YouTube video ID.": "استبدل VIDEO_ID بمعرّف فيديو YouTube المعتمد.",
  "Replace": "استبدل",
  "with the approved YouTube video ID.": "بمعرّف فيديو YouTube المعتمد.",
  "Your health conversation starts here.": "تبدأ رعايتك الصحية من هنا.",
  "Care tailored to you": "رعاية تناسب احتياجاتك",
  "Service availability, duration, pricing and insurance coverage must be confirmed with the clinic before booking.": "يرجى التأكد من توفر الخدمات ومدتها وأسعارها والتغطية التأمينية مع العيادة قبل الحجز.",
  "Typical duration: 30–60 min · Example fee: 30 KWD*": "المدة المعتادة: 30–60 دقيقة · رسوم تجريبية: 30 د.ك*",
  "Discuss symptoms and medical history": "ناقش الأعراض والتاريخ الطبي",
  "Personalized care recommendations": "توصيات رعاية مخصصة",
  "Insurance coverage: confirm with clinic": "التغطية التأمينية: يرجى التأكد من العيادة",
  "Blood Tests": "فحوصات الدم",
  "Typical duration: 15 min · Example fee: 20–50 KWD*": "المدة المعتادة: 15 دقيقة · رسوم تجريبية: 20–50 د.ك*",
  "Ask about available tests": "استفسر عن الفحوصات المتاحة",
  "Confirm any preparation instructions": "تأكد من تعليمات التحضير",
  "Results and follow-up as advised": "النتائج والمتابعة حسب التوصية الطبية",
  "ECG": "تخطيط القلب",
  "Typical duration: 20–45 min · Example fee: 40–80 KWD*": "المدة المعتادة: 20–45 دقيقة · رسوم تجريبية: 40–80 د.ك*",
  "Appointment-based assessment": "التقييم بناءً على موعد مسبق",
  "Ask the clinic about availability": "استفسر من العيادة عن التوفر",
  "Results reviewed by a clinician": "يراجع المختص النتائج",
  "Vaccinations": "التطعيمات",
  "Typical duration: 5–10 min · Example fee: 15–40 KWD*": "المدة المعتادة: 5–10 دقائق · رسوم تجريبية: 15–40 د.ك*",
  "Availability depends on stock and eligibility": "يعتمد التوفر على المخزون والأهلية",
  "Bring relevant vaccination records": "أحضر سجلات التطعيم ذات الصلة",
  "Confirm price and suitability in advance": "تأكد مسبقاً من السعر والملاءمة",
  "Typical duration: 20–30 min · Example fee: 25 KWD*": "المدة المعتادة: 20–30 دقيقة · رسوم تجريبية: 25 د.ك*",
  "Remote appointment where appropriate": "موعد عن بُعد عند ملاءمة الحالة",
  "Confirm suitability with the clinic": "تأكد من ملاءمة الخدمة مع العيادة",
  "Some concerns may need in-person review": "قد تتطلب بعض الحالات مراجعة حضورية",
  "Pre-Employment Checkup": "الفحص الطبي قبل التوظيف",
  "Typical duration: 45–60 min · Example fee: 50–100 KWD*": "المدة المعتادة: 45–60 دقيقة · رسوم تجريبية: 50–100 د.ك*",
  "Confirm the employer's requirements": "تأكد من متطلبات جهة العمل",
  "Ask which documents to bring": "استفسر عن المستندات المطلوبة",
  "Fees vary by requested assessment": "تختلف الرسوم حسب التقييم المطلوب",
  "*Example service durations and fees only. Replace with confirmed clinic information before publishing. This page is not medical advice.": "*المدد والرسوم أمثلة فقط. استبدلها بمعلومات مؤكدة من العيادة قبل النشر. هذه الصفحة ليست نصيحة طبية.",
  "Need a Service Not Listed?": "هل تبحث عن خدمة غير مدرجة؟",
  "Contact us to discuss your needs.": "تواصل معنا لمناقشة احتياجاتك.",
  "Contact Us": "اتصل بنا",
  "Clinic catalog": "كتالوج العيادة",
  "Browse products and send your cart to the clinic through WhatsApp. No online payment is offered.": "تصفح المنتجات وأرسل سلة مشترياتك إلى العيادة عبر واتساب. لا يتوفر الدفع الإلكتروني.",
  "Product listings are examples and are not medical advice. Confirm products, prices, availability, suitability and regulatory compliance with the clinic. Never start or stop medication based only on this catalog.": "قائمة المنتجات أمثلة وليست نصيحة طبية. تأكد من المنتجات والأسعار والتوفر والملاءمة والامتثال التنظيمي مع العيادة. لا تبدأ أو توقف دواءً اعتماداً على هذا الكتالوج فقط.",
  "Filter products": "تصفية المنتجات",
  "Your Cart": "سلة مشترياتك",
  "No payment is taken online. Orders are confirmed directly with the clinic.": "لا يتم الدفع عبر الإنترنت. تؤكد الطلبات مباشرة مع العيادة.",
  "Your cart is empty.": "سلة مشترياتك فارغة.",
  "Pay online with myFatoorah": "ادفع عبر الإنترنت باستخدام myFatoorah",
  "Total:": "الإجمالي:",
  "Send Order via WhatsApp": "أرسل الطلب عبر واتساب",
  "No products in this category.": "لا توجد منتجات في هذه الفئة.",
  "Shop Temporarily Unavailable": "المتجر غير متاح مؤقتاً",
  "Please contact the clinic directly for product enquiries.": "يرجى التواصل مباشرة مع العيادة للاستفسار عن المنتجات.",
  "Contact the Clinic": "تواصل مع العيادة",
  "We're here to help": "يسعدنا مساعدتك",
  "Send an appointment request and the clinic will contact you to confirm a suitable time.": "أرسل طلب موعد وستتواصل معك العيادة لتأكيد الوقت المناسب.",
  "Request an Appointment": "طلب موعد",
  "Tell us what time works for you. This is a request, not a confirmed booking; the clinic will contact you to confirm availability.": "أخبرنا بالوقت المناسب لك. هذا طلب وليس موعداً مؤكداً؛ ستتواصل العيادة معك لتأكيد التوفر.",
  "Name": "الاسم",
  "Email": "البريد الإلكتروني",
  "Phone": "الهاتف",
  "Service": "الخدمة",
  "Select a service": "اختر خدمة",
  "Other": "أخرى",
  "Preferred date": "التاريخ المفضل",
  "Preferred time": "الوقت المفضل",
  "For example, morning or afternoon": "مثال: صباحاً أو بعد الظهر",
  "Notes": "ملاحظات",
  "Please do not include urgent or sensitive medical information.": "يرجى عدم تضمين معلومات طبية طارئة أو حساسة.",
  "Send Appointment Request": "إرسال طلب الموعد",
  "Request received": "تم استلام الطلب",
  "Your request was sent to the clinic. The appointment is not confirmed until the clinic contacts you.": "تم إرسال طلبك إلى العيادة. لا يُعد الموعد مؤكداً حتى تتواصل معك العيادة.",
  "Contact the clinic": "تواصل مع العيادة",
  "Contact the clinic on WhatsApp": "تواصل مع العيادة عبر واتساب",
  "Return to the home page": "العودة إلى الصفحة الرئيسية",
  "Call Us": "اتصل بنا",
  "Call Now": "اتصل الآن",
  "WhatsApp": "واتساب",
  "Message Now": "أرسل رسالة الآن",
  "Send Email": "أرسل بريداً إلكترونياً",
  "Clinic Hours": "ساعات عمل العيادة",
  "Get in touch": "تواصل معنا",
  "Contact the clinic for appointments, service availability and general enquiries.": "تواصل مع العيادة للمواعيد وتوفر الخدمات والاستفسارات العامة.",
  "Address": "العنوان",
  "Get Directions": "احصل على الاتجاهات",
  "Replace the Google Maps URL in": "استبدل رابط خرائط Google في",
  "with the clinic's embed URL.": "برابط التضمين الخاص بالعيادة.",
  "Open map search": "افتح البحث على الخريطة",
  "Send a Message": "أرسل رسالة",
  "Send Message": "أرسل الرسالة",
  "Message received": "تم استلام الرسالة",
  "Your message was sent to the clinic. For urgent needs, call the clinic directly or emergency services.": "تم إرسال رسالتك إلى العيادة. للحالات العاجلة، اتصل بالعيادة مباشرة أو بخدمات الطوارئ.",
  "Request an appointment": "اطلب موعداً",
  "Forms are processed after deployment on Netlify. Avoid sending urgent or sensitive medical information through this website.": "تتم معالجة النماذج بعد نشر الموقع على Netlify. تجنب إرسال معلومات طبية طارئة أو حساسة عبر هذا الموقع.",
  "Helpful information": "معلومات مفيدة",
  "Frequently Asked Questions": "الأسئلة الشائعة",
  "Contact the clinic if your question is not answered here.": "تواصل مع العيادة إذا لم تجد إجابة عن سؤالك هنا.",
  "Appointments": "المواعيد",
  "Do you accept walk-in patients?": "هل تستقبلون المرضى دون موعد؟",
  "Please call the clinic to confirm current availability. Walk-in appointments are not guaranteed.": "يرجى الاتصال بالعيادة للتأكد من التوفر الحالي. لا يمكن ضمان استقبال المرضى دون موعد.",
  "How do I cancel or reschedule an appointment?": "كيف يمكنني إلغاء الموعد أو تغييره؟",
  "Use the appointment confirmation instructions or contact the clinic by phone or WhatsApp as early as possible.": "اتبع تعليمات تأكيد الموعد أو تواصل مع العيادة هاتفياً أو عبر واتساب في أقرب وقت ممكن.",
  "What should I bring to my appointment?": "ماذا ينبغي أن أحضر إلى الموعد؟",
  "Bring relevant identification, medical records, medication details and any clinic-requested documents. Call ahead if unsure.": "أحضر إثبات الهوية والسجلات الطبية ومعلومات الأدوية وأي مستندات طلبتها العيادة. اتصل مسبقاً إذا لم تكن متأكداً.",
  "Billing and services": "الفواتير والخدمات",
  "How much do services cost?": "ما تكلفة الخدمات؟",
  "Fees may depend on the service and tests required. Contact the clinic for current pricing; example prices on this site are not a quote.": "قد تعتمد الرسوم على الخدمة والفحوصات المطلوبة. تواصل مع العيادة لمعرفة الأسعار الحالية؛ الأسعار التوضيحية في الموقع ليست عرض سعر.",
  "How do I order products from the shop?": "كيف أطلب المنتجات من المتجر؟",
  "Use the WhatsApp order link to ask the clinic about availability and payment or collection arrangements. No online checkout is provided.": "استخدم رابط الطلب عبر واتساب للاستفسار من العيادة عن التوفر وترتيبات الدفع أو الاستلام. لا يتوفر إتمام الشراء عبر الإنترنت.",
  "Should I start a supplement listed here?": "هل أبدأ باستخدام مكمل غذائي معروض هنا؟",
  "No product listing is a medical recommendation for your individual situation. Discuss any medicine or supplement with a qualified healthcare professional.": "لا تمثل المنتجات المعروضة توصية طبية لحالتك. ناقش أي دواء أو مكمل غذائي مع مختص صحي مؤهل.",
  "Patient voices": "آراء المرضى",
  "Only publish genuine reviews with appropriate patient consent. Replace all sample content below before launch.": "انشر الآراء الحقيقية فقط بعد الحصول على موافقة المرضى. استبدل جميع الأمثلة أدناه قبل الإطلاق.",
  "All testimonial text and names below are placeholders, not real patient reviews.": "جميع النصوص والأسماء أدناه مؤقتة وليست آراء حقيقية للمرضى.",
  "[Replace with a genuine testimonial approved by the patient. Do not publish sensitive health information.]": "[استبدلها بشهادة حقيقية وافق عليها المريض. لا تنشر معلومات صحية حساسة.]",
  "[Patient name or approved anonymous label]": "[اسم المريض أو تسمية مجهولة معتمدة]",
  "Google Reviews": "تقييمات Google",
  "Optional: add an authorized reviews widget or link to the clinic's verified Google Business Profile. Do not imply an endorsement or display unverified ratings.": "اختياري: أضف أداة تقييمات مصرحاً بها أو رابطاً إلى الملف التجاري الموثق للعيادة على Google. لا توحِ بوجود تأييد ولا تعرض تقييماً غير موثق.",
  "Find us on Google Maps": "اعثر علينا على خرائط Google",
  "Instagram profile": "حساب إنستغرام",
  "Facebook profile": "حساب فيسبوك",
  "LinkedIn profile": "حساب لينكدإن",
  "Shop": "المتجر",
  "Remove": "إزالة",
  "Out of Stock": "نفد من المخزون",
  "Product available": "المنتج متوفر",
  "Currently unavailable": "غير متوفر حالياً",
  "Currently unavailable": "غير متوفر حالياً",
  "Add to Cart": "أضف إلى السلة",
  "View in Shop": "عرض في المتجر",
  "View product in shop": "عرض المنتج في المتجر",
  "Joint health supplement. Please consult your clinician before use.": "مكمل غذائي لصحة المفاصل. يرجى استشارة الطبيب قبل الاستخدام.",
  "Fish oil supplement. Please consult your clinician before use.": "مكمل زيت سمك. يرجى استشارة الطبيب قبل الاستخدام.",
  "Automatic digital blood pressure monitor.": "جهاز رقمي أوتوماتيكي لقياس ضغط الدم.",
  "Vitamin D supplement. Please consult your clinician before use.": "مكمل فيتامين د. يرجى استشارة الطبيب قبل الاستخدام.",
  "Home blood glucose monitoring kit.": "جهاز منزلي لمراقبة مستوى السكر في الدم.",
  "Probiotic supplement. Please consult your clinician before use.": "مكمل بروبيوتيك. يرجى استشارة الطبيب قبل الاستخدام.",
  "Glucosamine 1500mg": "غلوكوزامين 1500 ملغ",
  "Omega-3 Fish Oil": "زيت سمك أوميغا 3",
  "Blood Pressure Monitor": "جهاز قياس ضغط الدم",
  "Vitamin D3 1000 IU": "فيتامين D3 بجرعة 1000 وحدة دولية",
  "Glucometer Kit": "جهاز قياس السكر",
  "Probiotic Complex": "مركب البروبيوتيك",
  "For emergencies, call 112 or visit the nearest hospital. This website is not monitored for emergencies.": "للطوارئ، اتصل بالرقم 112 أو توجّه إلى أقرب مستشفى. لا تتم مراقبة هذا الموقع للحالات الطارئة.",
  "©": "©",
  "each": "للوحدة",
  "quantity": "الكمية",
  "Decrease": "خفض",
  "Increase": "زيادة",
  "from cart": "من السلة",
  "Hello": "مرحباً",
  "I would like to order:": "أود طلب:",
  "Please confirm availability and payment details. Thank you!": "يرجى تأكيد التوفر وتفاصيل الدفع. شكراً لكم!",
  "Instagram profile to configure": "حساب إنستغرام لإضافته",
  "Facebook profile to configure": "حساب فيسبوك لإضافته",
  "LinkedIn profile to configure": "حساب لينكدإن لإضافته",
  "Add the clinic's WhatsApp number in js/data.js": "أضف رقم واتساب العيادة في js/data.js",
  "Map showing the clinic location": "خريطة توضح موقع العيادة",
  "Introduction to Dr. [Name]": "مقدمة عن د. [Name]",
  "About Dr. [Name] | Dr. [Name] Clinic": "عن د. [Name] | عيادة د. [Name]",
  "Services | Dr. [Name] Clinic": "الخدمات | عيادة د. [Name]",
  "Shop | Dr. [Name] Clinic": "المتجر | عيادة د. [Name]",
  "Appointments | Dr. [Name] Clinic": "المواعيد | عيادة د. [Name]",
  "Contact | Dr. [Name] Clinic": "اتصل بنا | عيادة د. [Name]",
  "Frequently Asked Questions | Dr. [Name] Clinic": "الأسئلة الشائعة | عيادة د. [Name]",
  "Patient Testimonials | Dr. [Name] Clinic": "آراء المرضى | عيادة د. [Name]",
  "Dr. [Name] Clinic | [Specialty] in Kuwait": "عيادة د. [Name] | [Specialty] في الكويت",
  "Learn about Dr. [Name] and the clinic.": "تعرف على د. [Name] والعيادة.",
  "Explore services available at Dr. [Name]'s clinic in Kuwait.": "اكتشف الخدمات المتوفرة في عيادة د. [Name] في الكويت.",
  "Browse products recommended by Dr. [Name]'s clinic.": "تصفح المنتجات التي توصي بها عيادة د. [Name].",
  "Request an appointment with Dr. [Name] in Kuwait.": "اطلب موعداً مع د. [Name] في الكويت.",
  "Contact Dr. [Name]'s clinic in Kuwait.": "تواصل مع عيادة د. [Name] في الكويت.",
  "Answers to common questions about appointments, services and products.": "إجابات عن الأسئلة الشائعة حول المواعيد والخدمات والمنتجات.",
  "Patient experiences at Dr. [Name]'s clinic.": "تجارب المرضى في عيادة د. [Name].",
  "Replace with the doctor's approved portrait": "استبدلها بصورة الطبيب المعتمدة",
  "Patient photo placeholder": "صورة مؤقتة لمريض",
  "Patient image placeholder": "صورة مؤقتة لمريض"
};

const hindiTranslations = {
  "Skip to content": "मुख्य सामग्री पर जाएँ",
  "Sunday": "रविवार",
  "Monday": "सोमवार",
  "Tuesday": "मंगलवार",
  "Wednesday": "बुधवार",
  "Thursday": "गुरुवार",
  "Friday": "शुक्रवार",
  "Saturday": "शनिवार",
  "8 AM–8 PM": "सुबह 8–रात 8 बजे",
  "Clinic portrait placeholder": "क्लिनिक के डॉक्टर का चित्र",
  "Dr. [Name] Clinic": "डॉ. [Name] क्लिनिक",
  "Dr. [Name]": "डॉ. [Name]",
  "[Specialty]": "[विशेषज्ञता]",
  "[Full clinic address, Kuwait]": "[क्लिनिक का पूरा पता, कुवैत]",
  "[PHONE]": "[फ़ोन नंबर]",
  "Book": "बुक करें",
  "Shop | Dr. [Name] Clinic": "दुकान | डॉ. [Name] क्लिनिक",
  "Contact | Dr. [Name] Clinic": "संपर्क | डॉ. [Name] क्लिनिक",
  "Health Tools | Dr. [Name] Clinic": "स्वास्थ्य उपकरण | डॉ. [Name] क्लिनिक",
  "Dr. [Name] Clinic | [Specialty] in Kuwait": "डॉ. [Name] क्लिनिक | कुवैत में [Specialty]",
  "Clinic Blog | Dr. [Name] Clinic": "क्लिनिक ब्लॉग | डॉ. [Name] क्लिनिक",
  "About Dr. [Name] | Dr. [Name] Clinic": "डॉ. [Name] के बारे में | डॉ. [Name] क्लिनिक",
  "Appointments | Dr. [Name] Clinic": "अपॉइंटमेंट | डॉ. [Name] क्लिनिक",
  "Services | Dr. [Name] Clinic": "सेवाएँ | डॉ. [Name] क्लिनिक",
  "FAQ & Reviews | Dr. [Name] Clinic": "प्रश्न और समीक्षाएँ | डॉ. [Name] क्लिनिक",
  "Answers to common questions and clinic-approved patient reviews.": "सामान्य प्रश्नों के उत्तर और क्लिनिक द्वारा स्वीकृत रोगी समीक्षाएँ।",
  "About Dr. [Name]": "डॉ. [Name] के बारे में",
  "Care you can count on": "विश्वसनीय स्वास्थ्य देखभाल",
  "How we can help": "हम आपकी कैसे सहायता कर सकते हैं",
  "Our Services": "हमारी सेवाएँ",
  "Clinic highlights": "क्लिनिक की विशेषताएँ",
  "Recommended Products": "अनुशंसित उत्पाद",
  "Patient Testimonials": "रोगियों की समीक्षाएँ",
  "Ready to Book Your Appointment?": "क्या आप अपॉइंटमेंट बुक करने के लिए तैयार हैं?",
  "Book Now": "अभी बुक करें",
  "Book an appointment": "अपॉइंटमेंट बुक करें",
  "Send Message": "संदेश भेजें",
  "Submit appointment request": "अपॉइंटमेंट अनुरोध भेजें",
  "Your name": "आपका नाम",
  "Full name": "पूरा नाम",
  "Email address": "ईमेल पता",
  "Phone number": "फ़ोन नंबर",
  "Preferred date": "पसंदीदा तारीख",
  "Preferred time": "पसंदीदा समय",
  "Message": "संदेश",
  "Send": "भेजें",
  "Service": "सेवा",
  "Select a service": "सेवा चुनें",
  "Confirm with clinic": "क्लिनिक से पुष्टि करें",
  "Products found": "उत्पाद मिले",
  "All Products": "सभी उत्पाद",
  "In Stock": "स्टॉक में उपलब्ध",
  "Add to cart": "कार्ट में जोड़ें",
  "View cart": "कार्ट देखें",
  "Your cart is empty.": "आपका कार्ट खाली है।",
  "Checkout via WhatsApp": "WhatsApp से ऑर्डर करें",
  "Search products": "उत्पाद खोजें",
  "In-stock products only": "केवल स्टॉक में उपलब्ध",
  "Filter by category": "श्रेणी के अनुसार फ़िल्टर करें",
  "All categories": "सभी श्रेणियाँ",
  "Services and fees": "सेवाएँ और शुल्क",
  "Contact the clinic": "क्लिनिक से संपर्क करें",
  "Call Now": "अभी कॉल करें",
  "Send Email": "ईमेल भेजें",
  "Get in touch": "संपर्क करें",
  "Contact Us": "हमसे संपर्क करें",
  "Your message has been received.": "आपका संदेश प्राप्त हो गया है।",
  "Your appointment request has been received.": "आपका अपॉइंटमेंट अनुरोध प्राप्त हो गया है।",
  "KWD": "कुवैती दीनार",
  "Joint health supplement. Please consult your clinician before use.": "जोड़ों के स्वास्थ्य के लिए सप्लीमेंट। उपयोग से पहले अपने चिकित्सक से सलाह लें।",
  "Fish oil supplement. Please consult your clinician before use.": "मछली के तेल का सप्लीमेंट। उपयोग से पहले अपने चिकित्सक से सलाह लें।",
  "Automatic digital blood pressure monitor.": "स्वचालित डिजिटल रक्तचाप मॉनिटर।",
  "Vitamin D supplement. Please consult your clinician before use.": "विटामिन D सप्लीमेंट। उपयोग से पहले अपने चिकित्सक से सलाह लें।",
  "Glucosamine 1500mg": "ग्लूकोसामीन 1500 mg",
  "Omega-3 Fish Oil": "ओमेगा-3 मछली का तेल",
  "Blood Pressure Monitor": "रक्तचाप मॉनिटर",
  "Vitamin D3 1000 IU": "विटामिन D3 1000 IU",
  "Home": "होम",
  "About": "डॉक्टर के बारे में",
  "Services": "सेवाएँ",
  "Shop": "दुकान",
  "Appointment": "अपॉइंटमेंट",
  "Contact": "संपर्क",
  "FAQ": "अक्सर पूछे जाने वाले प्रश्न",
  "Reviews": "समीक्षाएँ",
  "FAQ & Reviews": "प्रश्न और समीक्षाएँ",
  "Clinic Blog": "क्लिनिक ब्लॉग",
  "Health Tools": "स्वास्थ्य उपकरण",
  "Text size": "पाठ का आकार",
  "Medicines": "दवाइयाँ",
  "Supplements": "सप्लीमेंट",
  "Medical Devices": "चिकित्सा उपकरण",
  "Other": "अन्य",
  "Out of Stock": "स्टॉक में नहीं",
  "Add to Cart": "कार्ट में जोड़ें",
  "Currently unavailable": "अभी उपलब्ध नहीं",
  "View in Shop": "दुकान में देखें",
  "Pay online with myFatoorah": "myFatoorah से ऑनलाइन भुगतान करें",
  "products found": "उत्पाद मिले",
  "No products match your search or filters.": "आपकी खोज या फ़िल्टर से मेल खाने वाले उत्पाद नहीं मिले।",
  "Browse products and send your cart to the clinic through WhatsApp. No online payment is offered.": "उत्पाद देखें और WhatsApp के ज़रिए अपना कार्ट क्लिनिक को भेजें। ऑनलाइन भुगतान उपलब्ध नहीं है।",
  "Filter products": "उत्पाद फ़िल्टर करें",
  "Estimated items total:": "अनुमानित कुल:",
  "Clear cart": "कार्ट खाली करें",
  "Clinic product order": "क्लिनिक उत्पाद ऑर्डर",
  "Please confirm stock, final pricing, and collection or delivery. No payment has been made.": "कृपया स्टॉक, अंतिम कीमत और पिकअप या डिलीवरी की पुष्टि करें। कोई भुगतान नहीं किया गया है।",
  "Check live availability": "वास्तविक उपलब्धता देखें",
  "Open live booking calendar": "लाइव बुकिंग कैलेंडर खोलें",
  "Choose an available time in the clinic's hosted booking calendar.": "क्लिनिक के बुकिंग कैलेंडर में उपलब्ध समय चुनें।",
  "Language": "भाषा",
  "Main navigation": "मुख्य नेविगेशन",
  "Open menu": "मेनू खोलें",
  "Close menu": "मेनू बंद करें",
  "Close navigation menu": "नेविगेशन मेनू बंद करें",
  "Helpful information": "उपयोगी जानकारी",
  "Frequently Asked Questions": "अक्सर पूछे जाने वाले प्रश्न",
  "Patient experiences": "रोगियों के अनुभव",
  "Clinic-approved reviews": "क्लिनिक द्वारा स्वीकृत समीक्षाएँ",
  "Reviews are shown only with patient consent and clinic approval.": "समीक्षाएँ केवल रोगी की सहमति और क्लिनिक की स्वीकृति से दिखाई जाती हैं।",
  "No approved reviews are available yet.": "अभी कोई स्वीकृत समीक्षा उपलब्ध नहीं है।",
  "Clinic": "क्लिनिक",
  "Quick Links": "त्वरित लिंक",
  "Hours": "कार्य समय",
  "Hours:": "कार्य समय:",
  "All rights reserved.": "सर्वाधिकार सुरक्षित।",
  "Meet your doctor": "अपने डॉक्टर से मिलें",
  "Book an Appointment": "अपॉइंटमेंट बुक करें",
  "Chat on WhatsApp": "WhatsApp पर संपर्क करें",
  "Share doctor profile": "डॉक्टर की जानकारी साझा करें",
  "Save clinic contact": "क्लिनिक का संपर्क सहेजें",
  "Working schedule": "कार्य समय-सारणी",
  "Share article": "लेख साझा करें",
  "Read article": "लेख पढ़ें",
  "Copy link": "लिंक कॉपी करें",
  "Link copied": "लिंक कॉपी हो गया",
  "Share this page": "यह पृष्ठ साझा करें",
  "Estimates only": "केवल अनुमान",
  "Health Calculators": "स्वास्थ्य गणक",
  "Adult BMI estimate": "वयस्क BMI अनुमान",
  "For adults only. BMI is a screening measure, not a diagnosis.": "केवल वयस्कों के लिए। BMI एक प्रारंभिक जांच है, निदान नहीं।",
  "Calculate BMI": "BMI गणना करें",
  "Estimated due date": "अनुमानित प्रसव तिथि",
  "Gregorian and Hijri date": "ग्रेगोरियन और हिजरी तारीख",
  "Convert date": "तारीख बदलें",
  "Gregorian date": "ग्रेगोरियन तारीख",
  "Date and time format converter": "तारीख प्रारूप कनवर्टर",
  "Latest articles": "नवीनतम लेख",
  "There are no published articles yet.": "अभी कोई लेख प्रकाशित नहीं हुआ है।",
  "Articles are for general information only and are not a substitute for individual medical advice. For urgent concerns, contact emergency services.": "लेख केवल सामान्य जानकारी के लिए हैं और व्यक्तिगत चिकित्सा सलाह का विकल्प नहीं हैं। तत्काल सहायता के लिए आपातकालीन सेवाओं से संपर्क करें।",
  "Health information": "स्वास्थ्य जानकारी",
  "Clinic-approved articles and updates.": "क्लिनिक द्वारा स्वीकृत लेख और अपडेट।",
  "Your care, made simple": "आपकी देखभाल, आसान तरीके से",
  "Explore the clinic": "क्लिनिक देखें",
  "The clinic blog is currently unavailable.": "क्लिनिक ब्लॉग अभी उपलब्ध नहीं है।",
  "Return to the clinic website": "क्लिनिक वेबसाइट पर लौटें",
  "Share": "साझा करें",
  "English": "अंग्रेज़ी",
  "Hindi": "हिन्दी",
  "Arabic": "अरबी",
  "Sun–Thu": "रवि–गुरु",
  "Fri–Sat": "शुक्र–शनि",
  "Closed": "बंद",
  "Accessibility": "सुलभता",
  "Reading options": "पढ़ने के विकल्प",
  "Readable font": "पढ़ने योग्य फ़ॉन्ट",
  "Underline links": "लिंक रेखांकित करें",
  "High contrast": "उच्च कंट्रास्ट",
  "Increase text spacing": "पाठ के बीच दूरी बढ़ाएँ",
  "Reduce motion": "गतिशीलता कम करें",
  "Reset accessibility settings": "सुलभता सेटिंग रीसेट करें",
  "Settings reset.": "सेटिंग रीसेट हो गई।",
  "Emergency information": "आपातकालीन जानकारी",
  "General Consultation": "सामान्य परामर्श",
  "Discuss your health concerns and care options with the doctor.": "अपनी स्वास्थ्य चिंताओं और देखभाल के विकल्पों पर डॉक्टर से चर्चा करें।",
  "Diagnostic Testing": "नैदानिक परीक्षण",
  "Telemedicine": "टेलीमेडिसिन",
  "View all services": "सभी सेवाएँ देखें",
  "Contact the clinic if your question is not answered here.": "यदि आपके प्रश्न का उत्तर यहाँ नहीं है, तो क्लिनिक से संपर्क करें।",
  "Appointments": "अपॉइंटमेंट",
  "Billing and services": "शुल्क और सेवाएँ",
  "How much do services cost?": "सेवाओं का शुल्क कितना है?",
  "This field is required.": "यह फ़ील्ड आवश्यक है।",
  "Enter a valid value.": "मान्य जानकारी दर्ज करें।",
  "Please correct the following fields:": "कृपया निम्नलिखित फ़ील्ड ठीक करें:",
  "Parking": "पार्किंग",
  "Get Directions": "रास्ता देखें",
  "Open in Waze": "Waze में खोलें",
  "Phone": "फ़ोन",
  "Email": "ईमेल",
  "Address": "पता",
  "Clinic Hours": "क्लिनिक का समय",
  "Blog": "ब्लॉग",
  "Read more": "और पढ़ें",
  "Search articles": "लेख खोजें",
  "No articles match your search.": "आपकी खोज से मेल खाने वाला कोई लेख नहीं है।",
  "Learn about the clinic and its doctor. Contact the clinic to confirm services and availability.": "क्लिनिक और उसके डॉक्टर के बारे में जानें। सेवाओं और उपलब्धता की पुष्टि के लिए क्लिनिक से संपर्क करें।",
  "Watch the clinic-approved introduction.": "क्लिनिक द्वारा स्वीकृत परिचय देखें।",
  "Your health conversation starts here.": "आपकी स्वास्थ्य संबंधी बातचीत यहाँ से शुरू होती है।",
  "We're here to help": "हम सहायता के लिए यहाँ हैं",
  "Send an appointment request and the clinic will contact you to confirm a suitable time.": "अपॉइंटमेंट का अनुरोध भेजें। उपयुक्त समय की पुष्टि के लिए क्लिनिक आपसे संपर्क करेगा।",
  "Request an Appointment": "अपॉइंटमेंट का अनुरोध करें",
  "Tell us what time works for you. This is a request, not a confirmed booking; the clinic will contact you to confirm availability.": "अपनी पसंद का समय बताएँ। यह अनुरोध है, पक्की बुकिंग नहीं; उपलब्धता की पुष्टि के लिए क्लिनिक आपसे संपर्क करेगा।",
  "Bookings are managed by the external calendar. This website does not collect payment.": "बुकिंग बाहरी कैलेंडर द्वारा प्रबंधित होती है। यह वेबसाइट भुगतान नहीं लेती।",
  "Request received": "अनुरोध प्राप्त हुआ",
  "Your request was sent to the clinic. The appointment is not confirmed until the clinic contacts you.": "आपका अनुरोध क्लिनिक को भेज दिया गया है। क्लिनिक के संपर्क करने तक अपॉइंटमेंट पक्का नहीं है।",
  "Requested date and time (not confirmed):": "अनुरोधित तारीख और समय (पुष्टि नहीं हुई):",
  "Print request receipt": "अनुरोध की रसीद प्रिंट करें",
  "Add requested time to calendar (not confirmed)": "अनुरोधित समय कैलेंडर में जोड़ें (पुष्टि नहीं हुई)",
  "Return to the home page": "होम पेज पर लौटें",
  "Contact the clinic for appointments, service availability and general enquiries.": "अपॉइंटमेंट, सेवाओं की उपलब्धता और सामान्य प्रश्नों के लिए क्लिनिक से संपर्क करें।",
  "Send a Message": "संदेश भेजें",
  "Name": "नाम",
  "Care tailored to you": "आपके लिए उपयुक्त देखभाल",
  "Day": "दिन",
  "Meet Dr. [Name]": "डॉ. [Name] से मिलें",
  "at": "समय",
  "Answers to common questions and experiences shared with the clinic's approval.": "सामान्य प्रश्नों के उत्तर और क्लिनिक की स्वीकृति से साझा किए गए अनुभव।",
  "Dr. [Name], [Specialty] Specialist": "डॉ. [Name], [Specialty] विशेषज्ञ",
  "A selection of clinic services. Confirm availability, fees and insurance coverage with the clinic.": "क्लिनिक की कुछ सेवाएँ। उपलब्धता, शुल्क और बीमा कवरेज की पुष्टि क्लिनिक से करें।",
  "Ask the clinic about available tests and preparation instructions.": "उपलब्ध जाँचों और तैयारी के निर्देशों के बारे में क्लिनिक से पूछें।",
  "Remote appointments may be available for suitable concerns.": "उपयुक्त स्वास्थ्य समस्याओं के लिए दूरस्थ अपॉइंटमेंट उपलब्ध हो सकता है।",
  "Clinic recommendations": "क्लिनिक की अनुशंसाएँ",
  "Product information is illustrative. Consult a qualified healthcare professional before using any medicine or supplement.": "उत्पाद की जानकारी केवल उदाहरण के लिए है। किसी दवा या सप्लीमेंट के उपयोग से पहले योग्य स्वास्थ्य पेशेवर से सलाह लें।",
  "Genuine testimonials are shared only with patient consent and clinic approval.": "वास्तविक समीक्षाएँ केवल रोगी की सहमति और क्लिनिक की स्वीकृति से साझा की जाती हैं।",
  "Contact the clinic to ask about appointment availability.": "अपॉइंटमेंट की उपलब्धता पूछने के लिए क्लिनिक से संपर्क करें।",
  "Service availability, duration, pricing and insurance coverage must be confirmed with the clinic before booking.": "बुकिंग से पहले सेवा की उपलब्धता, अवधि, कीमत और बीमा कवरेज की पुष्टि क्लिनिक से करें।",
  "Clinic catalog": "क्लिनिक कैटलॉग",
  "Product listings are examples and are not medical advice. Confirm products, prices, availability, suitability and regulatory compliance with the clinic. Never start or stop medication based only on this catalog.": "उत्पाद सूची केवल उदाहरण है, चिकित्सा सलाह नहीं। उत्पाद, कीमत, उपलब्धता, उपयुक्तता और नियामक अनुपालन की पुष्टि क्लिनिक से करें। केवल इस सूची के आधार पर दवा शुरू या बंद न करें।",
  "Self-service": "स्वयं उपयोग करें",
  "Simple estimates and personal tools. These tools do not diagnose, prescribe, or replace advice from a qualified healthcare professional.": "सरल अनुमान और व्यक्तिगत उपकरण। ये उपकरण निदान या नुस्खा नहीं देते और योग्य स्वास्थ्य पेशेवर की सलाह का विकल्प नहीं हैं।",
  "Calculations happen in this browser and are not sent to the clinic.": "गणनाएँ इसी ब्राउज़र में होती हैं और क्लिनिक को नहीं भेजी जातीं।",
  "Weight (kg)": "वज़न (किग्रा)",
  "Height (cm)": "ऊँचाई (सेमी)",
  "Based on the first day of the last menstrual period and a typical 28-day cycle. A clinician should confirm pregnancy dating.": "अंतिम मासिक धर्म के पहले दिन और सामान्य 28-दिन के चक्र के आधार पर। गर्भावस्था की अवधि की पुष्टि चिकित्सक से कराएँ।",
  "First day of last menstrual period": "अंतिम मासिक धर्म का पहला दिन",
  "Estimate due date": "प्रसव की अनुमानित तारीख निकालें",
  "Local device conversion": "डिवाइस पर स्थानीय रूपांतरण",
  "Convert a Gregorian date to a Hijri display. Hijri dates may vary by local moon-sighting practice.": "ग्रेगोरियन तारीख को हिजरी तारीख में बदलें। स्थानीय चाँद देखने की प्रथा के अनुसार हिजरी तारीख अलग हो सकती है।",
  "Clinic-maintained information": "क्लिनिक द्वारा प्रबंधित जानकारी",
  "Vaccination schedule information": "टीकाकरण कार्यक्रम की जानकारी",
  "This is informational only. Confirm the current Kuwait Ministry of Health schedule and individual eligibility with a clinician.": "यह जानकारी केवल सामान्य जानकारी के लिए है। कुवैत के स्वास्थ्य मंत्रालय के मौजूदा कार्यक्रम और व्यक्तिगत पात्रता की पुष्टि चिकित्सक से करें।",
  "Filter by age group": "आयु वर्ग के अनुसार फ़िल्टर करें",
  "All age groups": "सभी आयु वर्ग",
  "No schedule has been published by the clinic.": "क्लिनिक ने अभी कोई कार्यक्रम प्रकाशित नहीं किया है।",
  "Print schedule": "कार्यक्रम प्रिंट करें",
  "Locally verified times": "स्थानीय रूप से सत्यापित समय",
  "Prayer times": "नमाज़ का समय",
  "Times are published by the clinic and may vary by location and calculation method. Verify today's times with a trusted local source.": "समय क्लिनिक द्वारा प्रकाशित किए जाते हैं और स्थान तथा गणना पद्धति के अनुसार बदल सकते हैं। आज का समय विश्वसनीय स्थानीय स्रोत से जाँचें।",
  "Seasonal information": "मौसमी जानकारी",
  "Ramadan guidance": "रमज़ान मार्गदर्शन",
  "General clinic-reviewed information only. For advice about fasting or medicines, speak with your clinician.": "यह केवल क्लिनिक द्वारा समीक्षा की गई सामान्य जानकारी है। रोज़े या दवाओं के बारे में सलाह के लिए अपने चिकित्सक से बात करें।",
  "Current information": "मौजूदा जानकारी",
  "Seasonal health information": "मौसमी स्वास्थ्य जानकारी",
  "These clinic-published notes are informational and are not an emergency alert service.": "क्लिनिक द्वारा प्रकाशित ये नोट केवल जानकारी के लिए हैं, आपातकालीन चेतावनी सेवा नहीं।",
  "Medication-dose, infusion-rate, pediatric percentile, and disease-risk calculators are not provided. They require clinician-approved formulas, inputs, interpretation, and Arabic wording before publication.": "दवा की खुराक, इन्फ्यूज़न दर, बच्चों के पर्सेंटाइल और बीमारी के जोखिम के कैलकुलेटर उपलब्ध नहीं हैं। इनके प्रकाशन से पहले चिकित्सक द्वारा स्वीकृत सूत्र, इनपुट, व्याख्या और अनुवाद आवश्यक हैं।",
  "JavaScript is required to calculate estimates and convert dates and times.": "अनुमान लगाने और तारीख बदलने के लिए JavaScript आवश्यक है।",
  "For a suspected emergency, call 112 now or go to the nearest emergency department. Do not wait for a website reply.": "आपात स्थिति की आशंका होने पर तुरंत 112 पर कॉल करें या निकटतम आपातकालीन विभाग जाएँ। वेबसाइट के उत्तर की प्रतीक्षा न करें।"
};

// Set to false to hide shop links and product listings site-wide on the next deployment.
const shopEnabled = true;
