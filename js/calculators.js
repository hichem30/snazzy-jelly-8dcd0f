(() => {
  const language = () => document.documentElement.lang;
  const isArabic = () => language() === "ar";
  const formatDate = (date, calendar) => new Intl.DateTimeFormat(
    isArabic() ? "ar-KW-u-ca-islamic-umalqura" : `${language() === "hi" ? "hi-IN" : "en-KW"}-u-ca-${calendar}`,
    { dateStyle: "long" }
  ).format(date);

  const dateForm = document.querySelector("[data-date-converter]");
  const dateResult = document.querySelector("[data-date-result]");
  const dateInput = dateForm?.elements.date;
  let selectedDate;

  const renderDate = () => {
    if (!selectedDate || !dateResult) return;
    try {
      dateResult.textContent = isArabic()
        ? `الميلادي: ${formatDate(selectedDate, "gregory")} · الهجري: ${formatDate(selectedDate, "islamic-umalqura")}`
        : `Gregorian: ${formatDate(selectedDate, "gregory")} · Hijri (Umm al-Qura): ${formatDate(selectedDate, "islamic-umalqura")}`;
    } catch (error) {
      console.error("Could not format the date with this browser's calendar data.", error);
      dateResult.textContent = isArabic()
        ? "تعذر تحويل التاريخ في هذا المتصفح."
        : "This browser could not convert the date.";
    }
  };
  dateForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!dateForm.reportValidity()) return;
    const [year, month, day] = dateInput.value.split("-").map(Number);
    selectedDate = new Date(Date.UTC(year, month - 1, day, 12));
    renderDate();
  });
  const vaccinationSection = document.querySelector("[data-vaccination-section]");
  const vaccinationList = document.querySelector("[data-vaccination-list]");
  const ageFilter = document.querySelector("[data-vaccination-filter]");
  const emptyMessage = document.querySelector("[data-vaccination-empty]");
  const renderVaccinations = (schedule) => {
    if (!vaccinationSection || !vaccinationList || !ageFilter || !emptyMessage) return;
    const published = schedule.filter((entry) => entry.published);
    vaccinationSection.hidden = published.length === 0;
    if (!published.length) return;
    const ageGroups = [...new Set(published.map((entry) => entry.ageGroup))];
    ageFilter.replaceChildren(
      new Option(isArabic() ? "جميع الفئات العمرية" : language() === "hi" ? "सभी आयु वर्ग" : "All age groups", "all"),
      ...ageGroups.map((age) => new Option(language() === "hi"
        ? schedule.find((entry) => entry.ageGroup === age)?.ageGroupHi || age
        : age, age))
    );
    const renderList = () => {
      const selected = ageFilter.value;
      const entries = published.filter((entry) => selected === "all" || entry.ageGroup === selected);
      vaccinationList.replaceChildren(...entries.map((entry) => {
        const card = document.createElement("article");
        card.className = "information-card";
        const heading = document.createElement("h3");
        heading.textContent = `${language() === "hi" ? (entry.ageGroupHi || entry.ageGroup) : entry.ageGroup} — ${isArabic() ? entry.vaccineAr : language() === "hi" ? (entry.vaccineHi || entry.vaccine) : entry.vaccine}`;
        const body = document.createElement("p");
        body.textContent = isArabic() ? entry.detailsAr : language() === "hi" ? (entry.detailsHi || entry.details) : entry.details;
        card.append(heading, body);
        return card;
      }));
      emptyMessage.hidden = entries.length > 0;
    };
    ageFilter.addEventListener("change", renderList);
    renderList();
  };

  document.querySelector("[data-print-vaccinations]")?.addEventListener("click", () => window.print());
  window.siteDataReady?.then((config) => renderVaccinations(config.vaccinationSchedule || []))
    .catch((error) => console.error("Could not load the clinic vaccination schedule.", error));
  new MutationObserver(() => {
    renderDate();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
