# Dr. [Name] Clinic Website

A responsive HTML/CSS/JavaScript website for a private clinic in Kuwait. The public site is static. The clinic-owner dashboard at `/admin/` is a same-page editor for operational settings and content; a Netlify Function securely commits allowed JSON content updates to GitHub and Netlify deploys them. The small shop has a browser-persisted cart; orders can continue through WhatsApp, and optional myFatoorah-hosted payment links are available when enabled and configured by the clinic. Appointment requests open WhatsApp using the number configured in the clinic profile; contact messages use Netlify Forms when deployed on Netlify. The site supports English, Arabic, and Hindi; the dashboard edits English fields and preserves existing translations.

## Project structure

```text
index.html, about.html, services.html, shop.html, blog.html
appointment.html, contact.html, faq.html (includes clinic-approved reviews)
tools.html
css/style.css       Shared layout and responsive styles
css/ar.css          Right-to-left and Arabic typography styles
css/accessibility.css, css/print.css  Accessibility preferences and print layout
js/main.js          Navigation, accessibility controls, forms, product discovery, cart, sharing, and WhatsApp/payment links
js/data.js          English/Arabic/Hindi interface copy and site configuration loading/validation
js/content/*.json   Website data for the home page, clinic profile, hours, appointments, services, shop, blog, FAQs/reviews, and health information
service-worker.js   Offline cache for the public site shell
img/                Replaceable SVG portrait, testimonial, favicon, and product placeholders
admin/              Clinic-owner dashboard
netlify/functions/  Authenticated, allowlisted content publishing function
netlify.toml        Netlify function routing and static publishing configuration
```

## Admin workspace

The dashboard stays on `/admin/` and contains only day-to-day settings: opening hours, appointment options, services, shop and payment links, FAQs and reviews, and blog articles. Stable clinic details, branding, homepage copy, and setup-only configuration are intentionally excluded so they can be prepared before handoff. The dashboard does not use Decap or Turbo. Existing Arabic and Hindi values are preserved when English content is edited; new entries use English until separately translated.

## Customize before publishing

1. In the owner dashboard at `/admin/`, choose a section, edit its settings, and save. Saving commits the JSON file to the connected GitHub repository and triggers the normal Netlify deployment.
2. Update the page copy, prices, services, hours, and contact information to verified clinic details. Do not publish unverified credentials, patient quotes, or health claims.
3. Use **Clinic profile & contact** to upload the doctor's portrait, or **Shop & products** to upload product images. Obtain consent before publishing identifiable patient photographs or testimonials.
4. Manage services, opening hours, FAQs and testimonials in their matching admin sections. Translation fields are intentionally not exposed to the editor; existing Arabic and Hindi website content is retained. Newly added content falls back to its English copy until translations are added separately. Testimonials appear publicly only when both patient consent and clinic approval are checked.
5. Manage products in the admin: add, edit, or remove products; set their price, image, category, featured status, and availability. The shop supports text search, category filtering and an in-stock-only filter. Categories must match `Medicines`, `Supplements`, or `Medical Devices`.
6. To close or reopen the shop across the site, change the Shop setting in the admin. Each saved change is committed to the connected Git repository and published through a Netlify deploy; it is not an instant switch.
7. The cart is stored in the visitor's browser and can add, remove, and change quantities. It does not reserve stock. WhatsApp orders include product quantities and an estimated total; the clinic confirms stock and collection/delivery details. Optional myFatoorah-hosted payment links can be enabled in the admin; the website does not process payments or receive payment confirmation.
8. Set verified directions and Google Business Profile URLs, and add accurate parking/accessibility instructions. Do not publish guessed addresses, hours, fees, or credentials.
9. If the clinic uses a hosted booking calendar, enter its public HTTPS booking-page URL in the admin. The appointment page then offers a direct link to live availability. Appointment requests otherwise open a prefilled WhatsApp message to the clinic number configured under **Clinic profile & contact**; the visitor must tap Send in WhatsApp, and the request is not a confirmed booking. Calendar accounts, availability, confirmations, cancellations, and any calendar-side payment settings are managed by the booking provider and clinic, not by this static site.
10. To enable free Cloudflare Web Analytics, add the clinic website in Cloudflare's Web Analytics dashboard, then copy its public site token into the admin. This is a site identifier, not a secret API key. Analytics remains disabled when the field is blank. Before enabling analytics, the clinic should review its privacy notice and applicable privacy requirements.
11. The Contact page generates a Waze directions link from the clinic address when the owner has entered a real address. This uses Waze's public URL format and does not require an API key. A custom directions URL in the admin overrides it. Verify that the address resolves to the correct clinic entrance before launch.
12. The About page's approved introduction video is optional. Add a YouTube URL in the admin to show it; unsupported or blank URLs leave the section hidden.
13. The blog is enabled by default. Published posts support search, category filtering, expandable reading, and native sharing with a copy-link fallback. Existing translated article content remains on the site, but editors only manage the English fields; a clinician should review health information before publication. Changes deploy with the normal dashboard deployment.
14. On mobile, the bottom navigation dock links to Home, Services, Shop, Booking, and Contact. The slide-out menu can be closed using its close button, the backdrop, Escape, or a navigation link.
15. Service booking links preselect the requested service on the appointment form. The service choices follow enabled services in the admin. The appointment form opens a WhatsApp draft containing the request details; visitors must review and send it themselves. Appointment requests are not confirmed bookings.
16. Verify the WhatsApp number and appointment handoff after deployment. Contact messages are processed by Netlify Forms and require a Netlify deployment; they do not work when opening the HTML directly from disk.
17. The doctor's profile page can be shared as a contact card with the configured contact details and working schedule. Verify all clinic details and hours before sharing or publishing.
18. The Tools page includes an adult BMI estimate, an estimated due date, Gregorian/Hijri date conversion, and optional clinic-managed vaccination, prayer-time, Ramadan, and seasonal health information. Calculators run in the browser, are not diagnoses or treatment recommendations, and should be reviewed by the clinic before launch. Publish schedules only with current and verified sources. Pediatric medication-dose, infusion-rate, and disease-risk calculators remain excluded until clinician-approved formulas, ranges, and translations are supplied.
19. After opening the appointment request in WhatsApp, the form can offer an `.ics` reminder for the visitor's preferred date and time. This records a requested time only; it is not confirmation of a booking. Date and time remain in the page only to create the reminder.
20. The public site registers a service worker only on HTTPS or localhost and caches the public shell for offline reading. It is not an installable PWA; form submissions, admin edits, external maps, and payment pages require connectivity.
21. The Accessibility control supports text scaling, a readable font, underlined links, high contrast, increased text spacing, reduced motion, and resetting preferences. Preferences are stored in the visitor's browser. Print styles hide navigation and forms while preserving page content.
22. On mobile, the bottom navigation dock links to Home, Services, Shop, Booking, and Contact. On desktop these quick links are in the header, and the menu includes Health Tools and the combined FAQ & Reviews page.
23. The Contact page offers a downloadable vCard when clinic contact details are configured. The home page emits MedicalClinic structured data only after the name and address are replaced with real clinic details.
24. The About page displays doctor social icons only for valid HTTPS profiles entered under **Clinic profile & contact → Social media links**. Blank or invalid profiles remain hidden.
25. The chatbot, symptom/service decision flows, medication tracker, accepted-insurance listing, Patient Information page, and separate Seasonal Tips page are not included in the public site. FAQ and consent-approved reviews share one page. Energy estimates and the 12/24-hour converter were removed at the clinic's request.

## Run locally

Open the folder in VS Code and use a static file server (for example, the Live Server extension), or serve it with any local static HTTP server. External fonts and Font Awesome require an internet connection. The language selector switches supported English, Arabic, and Hindi copy; Arabic uses RTL and Hindi remains LTR. Existing translations are maintained in the website data files. The admin dashboard requires the Netlify Function and environment variables described below; use Netlify Dev to test authenticated saves locally.

## Deploy

- **Netlify Git (required for the owner dashboard):** Connect the Git repository and publish from the repository root so Netlify deploys both the static site and `netlify/functions/`.
- Other static hosting options can serve the public website, but do not provide this dashboard's Netlify Function and therefore cannot sign in or publish admin changes.

Hosting providers' free tiers, limits, availability, and terms may change. A custom domain may cost money.

## Dashboard setup (Netlify + GitHub)

The dashboard uses a Netlify Function at `netlify/functions/admin-api.mjs`; it stores no GitHub credentials in the browser. Before the dashboard can sign in or publish, connect the repository to Netlify and set these environment variables in the Netlify site settings:

- `ADMIN_PASSWORD`: a unique password at least 16 characters long. Share it only with the clinic owner.
- `ADMIN_SESSION_SECRET`: a private random value of at least 32 characters for signing eight-hour secure sessions.
- `GITHUB_TOKEN`: a fine-grained GitHub token restricted to this repository with **Contents: read and write** permission. Never put it in website files or commit it.
- `GITHUB_OWNER`, `GITHUB_REPO`, and optionally `GITHUB_BRANCH` (defaults to `main`).

After setting the variables, redeploy the site. The owner signs into `/admin/` with the dashboard password; they do not need a Turbo account or routine access to GitHub or Netlify. Use a unique password and rotate it by updating `ADMIN_PASSWORD` and redeploying; this also invalidates existing sessions. Saved updates are committed directly to the configured branch and appear after Netlify finishes deploying. There is no separate draft or preview-publish step.

The function accepts writes only for the seven dashboard-managed JSON files, checks the submitted file version to avoid overwriting a newer edit, and keeps its API credentials server-side. The dashboard is intentionally not an offline editor; use the deployed HTTPS site, or run the site with Netlify Dev and its environment variables when developing locally. Do not add clinic profile, branding, homepage copy, or other stable setup information to the dashboard unless owners need to change it routinely.

To add an editable section, add its JSON file to the function allowlist and validation in `netlify/functions/admin-api.mjs`, then add its form and navigation entry in `js/admin-dashboard.js`. Preserve existing non-English fields when changing records.

## Appearance

Visitors can switch between light and dark themes from the navigation menu. Their choice is saved in the browser; visitors without a saved choice follow their device's color-scheme preference.
