import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "clinic_admin";
const SECURE_COOKIE_NAME = "__Host-clinic_admin";
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const MAX_BODY_BYTES = 1_500_000;
const ALLOWED_FILES = new Set([
  "js/content/opening-hours.json",
  "js/content/appointments.json",
  "js/content/services.json",
  "js/content/shop.json",
  "js/content/site-settings.json",
  "js/content/patient-info.json",
  "js/content/blog.json"
]);

const jsonResponse = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers
    }
  });

function requiredSettings() {
  const { ADMIN_PASSWORD, ADMIN_SESSION_SECRET, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 16 ||
      !ADMIN_SESSION_SECRET || ADMIN_SESSION_SECRET.length < 32 ||
      !GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return null;
  }
  return {
    password: ADMIN_PASSWORD,
    sessionSecret: ADMIN_SESSION_SECRET,
    sessionKey: createHmac("sha256", ADMIN_SESSION_SECRET).update(ADMIN_PASSWORD).digest("base64url"),
    githubToken: GITHUB_TOKEN,
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || "main"
  };
}

function signature(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function cookieName(request) {
  return request.headers.get("x-forwarded-proto") === "https" ||
    new URL(request.url).protocol === "https:"
    ? SECURE_COOKIE_NAME
    : COOKIE_NAME;
}

function cookieValue(request) {
  const cookie = request.headers.get("cookie") || "";
  const name = cookieName(request);
  const pair = cookie.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return pair?.slice(name.length + 1) || "";
}

function hasSession(request, sessionKey) {
  const [expires, providedSignature] = cookieValue(request).split(".");
  if (!expires || !providedSignature || !/^\d+$/.test(expires) ||
      Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  const expected = signature(expires, sessionKey);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer);
}

function hasSameOrigin(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function readJson(request) {
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody) > MAX_BODY_BYTES) {
    throw new Error("The submitted content is too large.");
  }
  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error("The request body must be valid JSON.");
  }
}

function githubFileUrl(settings, file) {
  const encodedPath = file.split("/").map(encodeURIComponent).join("/");
  return `https://api.github.com/repos/${encodeURIComponent(settings.owner)}/${encodeURIComponent(settings.repo)}/contents/${encodedPath}`;
}

async function githubRequest(settings, url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${settings.githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "clinic-website-dashboard",
      ...init.headers
    }
  });
  if (!response.ok) {
    console.error("GitHub content operation failed.", response.status);
    const error = new Error(response.status === 409 || response.status === 422
      ? "This content changed elsewhere. Reload it and try again."
      : "Could not reach the publishing service. Try again later.");
    error.status = response.status === 409 || response.status === 422 ? 409 : 502;
    throw error;
  }
  return response.json();
}

function validateData(file, data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The submitted content has an invalid shape.");
  }

  const lists = {
    "js/content/opening-hours.json": ["hours"],
    "js/content/services.json": ["services"],
    "js/content/shop.json": ["products"],
    "js/content/patient-info.json": ["faqs", "testimonials"],
    "js/content/blog.json": ["blogPosts"]
  };
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
  for (const listName of lists[file] || []) {
    if (!Array.isArray(data[listName])) {
      throw new Error("The submitted content is missing a required list.");
    }
  }
  if (file === "js/content/opening-hours.json" &&
      !data.hours.every((row) => ["day", "dayAr", "hours", "hoursAr"]
        .every((key) => typeof row?.[key] === "string" && row[key].trim()))) {
    throw new Error("Every opening-hours row must include a day and hours.");
  }
  if (file === "js/content/appointments.json" &&
      (!["bookingUrl", "appointmentIntro", "appointmentSubmitLabel"].every((key) =>
        typeof data[key] === "string") ||
       !["appointmentRequestEnabled", "showPreferredDate", "showPreferredTime",
         "showAppointmentNotes", "calendarReminderEnabled"].every((key) =>
         typeof data[key] === "boolean"))) {
    throw new Error("Appointment settings are incomplete.");
  }
  if (file === "js/content/appointments.json" && data.bookingUrl.trim()) {
    try {
      if (new URL(data.bookingUrl).protocol !== "https:") throw new Error();
    } catch {
      throw new Error("Use a valid HTTPS booking page URL or leave the field blank.");
    }
  }
  if (file === "js/content/services.json" &&
      !data.services.every((service) =>
        ["name", "description", "duration", "fee"].every((key) => typeof service?.[key] === "string") &&
        service.name.trim() && service.description.trim() &&
        Array.isArray(service.details) &&
        typeof service.enabled === "boolean" &&
        validPaymentUrl(service.paymentLink || ""))) {
    throw new Error("Check service details and use valid HTTPS myFatoorah links.");
  }
  if (file === "js/content/shop.json" &&
      !data.products.every((product) =>
        typeof product?.name === "string" && typeof product.description === "string" &&
        typeof product.image === "string" && validProductImage(product.image) &&
        Number.isFinite(product.price) && product.price >= 0 &&
        ["Medicines", "Supplements", "Medical Devices"].includes(product.category) &&
        typeof product.featured === "boolean" && typeof product.inStock === "boolean" &&
        validPaymentUrl(product.paymentLink || ""))) {
    throw new Error("Check product details, category, price, and payment links.");
  }

  function validProductImage(value) {
    if (/^(?:\/)?img\/[A-Za-z0-9._/-]+$/.test(value) && !value.split("/").includes("..")) return true;
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }
  if (file === "js/content/patient-info.json" &&
      (!data.faqs.every((faq) =>
        ["category", "categoryAr", "question", "questionAr", "answer", "answerAr"]
          .every((key) => typeof faq?.[key] === "string") &&
        faq.category.trim() && faq.question.trim() && faq.answer.trim() &&
        typeof faq.enabled === "boolean") ||
       !data.testimonials.every((review) =>
        ["name", "quote", "quoteAr"].every((key) => typeof review?.[key] === "string") &&
        review.name.trim() && review.quote.trim() &&
        typeof review.approved === "boolean" && typeof review.consentConfirmed === "boolean"))) {
    throw new Error("Check FAQ content and ensure reviews include consent and approval settings.");
  }
  if (file === "js/content/blog.json" &&
      !data.blogPosts.every((post) =>
        ["title", "excerpt", "body", "date", "category"].every((key) => typeof post?.[key] === "string") &&
        post.title.trim() && post.excerpt.trim() && post.body.trim() && post.category.trim() &&
        isValidDate(post.date) &&
        typeof post.published === "boolean")) {
    throw new Error("Check each article’s title, summary, content, date, and publication status.");
  }
  if (file === "js/content/appointments.json" &&
      typeof data.appointmentRequestEnabled !== "boolean") {
    throw new Error("Appointment settings are incomplete.");
  }
  if (file === "js/content/shop.json" && typeof data.shopEnabled !== "boolean") {
    throw new Error("Shop settings are incomplete.");
  }
  if (file === "js/content/site-settings.json" &&
      typeof data.paymentLinks?.enabled !== "boolean") {
    throw new Error("Payment settings are incomplete.");
  }
  if (file === "js/content/blog.json" && typeof data.blogEnabled !== "boolean") {
    throw new Error("Blog settings are incomplete.");
  }
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export default async (request) => {
  const settings = requiredSettings();
  if (!settings) {
    return jsonResponse(503, { error: "Dashboard publishing has not been configured." });
  }

  const action = new URL(request.url).searchParams.get("action");
  if (request.method === "GET" && action === "session") {
    return jsonResponse(200, { authenticated: hasSession(request, settings.sessionKey) });
  }

  if (request.method === "POST" && !hasSameOrigin(request)) {
    return jsonResponse(403, { error: "This request was not accepted." });
  }

  if (request.method === "POST" && action === "login") {
    let body;
    try {
      body = await readJson(request);
    } catch (error) {
      return jsonResponse(400, { error: error.message });
    }
    const submittedPassword = typeof body?.password === "string" ? body.password : "";
    const submittedHash = createHmac("sha256", "clinic-admin-password-check").update(submittedPassword).digest();
    const expectedHash = createHmac("sha256", "clinic-admin-password-check").update(settings.password).digest();
    if (!timingSafeEqual(submittedHash, expectedHash)) {
      return jsonResponse(401, { error: "That password was not accepted." });
    }
    const expires = String(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS);
    const value = `${expires}.${signature(expires, settings.sessionKey)}`;
    const name = cookieName(request);
    const secure = name === SECURE_COOKIE_NAME ? " Secure;" : "";
    return jsonResponse(200, { authenticated: true }, {
      "Set-Cookie": `${name}=${value}; Path=/; HttpOnly;${secure} SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`
    });
  }

  if (request.method === "POST" && action === "logout") {
    const name = cookieName(request);
    const secure = name === SECURE_COOKIE_NAME ? " Secure;" : "";
    return jsonResponse(200, { authenticated: false }, {
      "Set-Cookie": `${name}=; Path=/; HttpOnly;${secure} SameSite=Strict; Max-Age=0`
    });
  }

  if (!hasSession(request, settings.sessionKey)) {
    return jsonResponse(401, { error: "Please sign in again." });
  }

  if (request.method === "GET" && action === "content") {
    const file = new URL(request.url).searchParams.get("file") || "";
    if (!ALLOWED_FILES.has(file)) return jsonResponse(404, { error: "Content not found." });
    try {
      const current = await githubRequest(
        settings,
        `${githubFileUrl(settings, file)}?ref=${encodeURIComponent(settings.branch)}`
      );
      const content = Buffer.from(current.content, "base64").toString("utf8");
      return jsonResponse(200, { data: JSON.parse(content), sha: current.sha });
    } catch (error) {
      return jsonResponse(error.status || 502, { error: error.message || "Could not load clinic content." });
    }
  }

  if (request.method === "POST" && action === "save") {
    let body;
    try {
      body = await readJson(request);
      if (!body || typeof body !== "object" || Array.isArray(body) ||
          !ALLOWED_FILES.has(body.file)) {
        return jsonResponse(404, { error: "Content not found." });
      }
      validateData(body.file, body.data);
      if (typeof body.sha !== "string" || !body.sha) {
        return jsonResponse(400, { error: "The content version is missing. Reload and try again." });
      }

      const url = `${githubFileUrl(settings, body.file)}?ref=${encodeURIComponent(settings.branch)}`;
      const current = await githubRequest(settings, url);
      if (current.sha !== body.sha) {
        return jsonResponse(409, { error: "This content changed elsewhere. Reload it and try again." });
      }
      const serialized = `${JSON.stringify(body.data, null, 2)}\n`;
      const updated = await githubRequest(settings, githubFileUrl(settings, body.file), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Update clinic website content",
          content: Buffer.from(serialized, "utf8").toString("base64"),
          sha: body.sha,
          branch: settings.branch
        })
      });
      return jsonResponse(200, { sha: updated.content.sha, commit: updated.commit.sha });
    } catch (error) {
      return jsonResponse(error.status || (error.message?.includes("too large") ? 413 : 400), {
        error: error.message || "Could not save clinic content."
      });
    }
  }

  return jsonResponse(404, { error: "Dashboard endpoint not found." });
};
