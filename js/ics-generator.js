(() => {
  const downloadButton = document.querySelector("[data-calendar-download]");
  const requestedAppointment = document.querySelector("[data-requested-appointment]");
  const requestedDate = document.querySelector("[data-requested-date]");
  const requestedTime = document.querySelector("[data-requested-time]");
  let eventData = null;

  const isValidDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  };
  const isValidTime = (value) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value || "");

  document.addEventListener("appointment:whatsapp-handoff", async (event) => {
    const { date = "", time = "" } = event.detail || {};
    if (!isValidDate(date) || !isValidTime(time)) return;
    eventData = { date, time };
    if (requestedDate && requestedTime && requestedAppointment) {
      requestedDate.dateTime = date;
      requestedDate.textContent = date;
      requestedTime.dateTime = time;
      requestedTime.textContent = time;
      requestedAppointment.hidden = false;
    }
    if (!downloadButton) return;

    try {
      const { calendarReminderEnabled } = await window.siteDataReady;
      downloadButton.hidden = !calendarReminderEnabled;
    } catch (error) {
      console.error("Could not load appointment reminder settings.", error);
    }
  });

  downloadButton?.addEventListener("click", () => {
    if (!eventData) return;
    const compactDate = eventData.date.replaceAll("-", "");
    const compactTime = `${eventData.time.replace(":", "")}00`;
    const [year, month, day] = eventData.date.split("-").map(Number);
    const [hour, minute] = eventData.time.split(":").map(Number);
    const end = new Date(year, month - 1, day, hour, minute + 30);
    const endDate = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, "0")}${String(end.getDate()).padStart(2, "0")}T${String(end.getHours()).padStart(2, "0")}${String(end.getMinutes()).padStart(2, "0")}00`;
    const uid = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const content = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Clinic Website//Appointment Request Reminder//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${uid}@clinic-website`,
      `DTSTAMP:${new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}/, "")}`,
      `DTSTART:${compactDate}T${compactTime}`,
      `DTEND:${endDate}`,
      "SUMMARY:Requested appointment time - NOT CONFIRMED",
      "DESCRIPTION:This is a reminder of the time requested in your appointment form. It is not a confirmed appointment. Contact the clinic to confirm.",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "clinic-appointment-request.ics";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
