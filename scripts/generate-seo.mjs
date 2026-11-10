import { readFile, writeFile } from "node:fs/promises";

const configuredUrl = process.env.SITE_URL || process.env.URL;
if (!configuredUrl) {
  throw new Error("Set SITE_URL (or use Netlify's URL build variable) to generate the sitemap.");
}

const siteUrl = new URL(configuredUrl);
if (siteUrl.protocol !== "https:" || siteUrl.username || siteUrl.password ||
    siteUrl.search || siteUrl.hash) {
  throw new Error("SITE_URL must be an HTTPS origin or base URL without credentials, query, or fragment.");
}

const baseUrl = siteUrl.href.replace(/\/+$/, "");
const publicPages = [
  "",
  "about.html",
  "services.html",
  "shop.html",
  "appointment.html",
  "contact.html",
  "faq.html",
  "tools.html"
];
const blog = JSON.parse(await readFile("js/content/blog.json", "utf8"));
if (blog.blogEnabled && blog.blogPosts.some((post) => post.published)) {
  publicPages.push("blog.html");
}
const entries = publicPages.map((page) => {
  const location = page ? `${baseUrl}/${page}` : `${baseUrl}/`;
  return `  <url><loc>${location}</loc></url>`;
}).join("\n");

await writeFile("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`);
await writeFile("robots.txt", `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${baseUrl}/sitemap.xml\n`);
