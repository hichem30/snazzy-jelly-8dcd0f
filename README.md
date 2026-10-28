# Dr. [Name] Clinic Website

A responsive HTML/CSS/JavaScript website for a private clinic in Kuwait. The public site is static; the optional admin uses Netlify Identity and Git Gateway to publish changes through the connected Git repository. The small shop has a browser-persisted cart; orders can continue through WhatsApp, and optional myFatoorah-hosted payment links are available when enabled and configured by the clinic. Appointment requests and contact messages use Netlify Forms when deployed on Netlify. The site has English, Arabic, and Hindi language options; CMS-managed content should be entered and reviewed in each supported language.

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
js/site-config.json Admin-editable clinic details, hours, services, FAQs, testimonials, optional blog, shop availability, payment links, and product catalog
service-worker.js   Offline cache for the public site shell
img/                Replaceable SVG portrait, testimonial, favicon, and product placeholders
admin/              Decap CMS dashboard for managing clinic content and products
```

## Customize before publishing

1. In the admin at `/admin/`, edit the doctor's name, specialty, bilingual biography, phone/WhatsApp number (country code, digits only), email, address, and map embed URL. These settings are stored in `js/site-config.json`.
2. Update the page copy, prices, services, hours, and contact information to verified clinic details. Do not publish unverified credentials, patient quotes, or health claims.
3. Replace `img/doctor.svg`, `img/patient1.svg`, `img/patient2.svg`, and the SVGs in `img/products/` with clinic-approved images. Update the corresponding paths in the HTML or `js/site-config.json` if you use different filenames. Obtain consent before publishing identifiable patient photographs or testimonials.
4. Manage services, opening hours, FAQs and testimonials in the admin. Hindi fields are optional but should be completed and reviewed for each clinic-managed entry; testimonials appear publicly only when both patient consent and clinic approval are checked.
5. Manage products in the admin: add, edit, or remove products; set their price, image path, category, featured status, and availability. The shop supports text search, category filtering and an in-stock-only filter. Categories must match `Medicines`, `Supplements`, or `Medical Devices`.
6. To close or reopen the shop across the site, change the Shop setting in the admin. Each saved change is committed to the connected Git repository and published through a Netlify deploy; it is not an instant switch.
7. The cart is stored in the visitor's browser and can add, remove, and change quantities. It does not reserve stock. WhatsApp orders include product quantities and an estimated total; the clinic confirms stock and collection/delivery details. Optional myFatoorah-hosted payment links can be enabled in the admin; the website does not process payments or receive payment confirmation.
8. Set verified directions and Google Business Profile URLs, and add accurate parking/accessibility instructions in both languages. Do not publish guessed addresses, hours, fees, or credentials.
9. If the clinic uses a hosted booking calendar, enter its public HTTPS booking-page URL in the admin. The appointment page then offers a direct link to live availability; the existing request form remains available. Calendar accounts, availability, confirmations, cancellations, and any calendar-side payment settings are managed by the booking provider and clinic, not by this static site.
10. To enable free Cloudflare Web Analytics, add the clinic website in Cloudflare's Web Analytics dashboard, then copy its public site token into the admin. This is a site identifier, not a secret API key. Analytics remains disabled when the field is blank. Before enabling analytics, the clinic should review its privacy notice and applicable privacy requirements.
11. The Contact page generates a Waze directions link from the clinic address when the owner has entered a real address. This uses Waze's public URL format and does not require an API key. A custom directions URL in the admin overrides it. Verify that the address resolves to the correct clinic entrance before launch.
12. The About page's approved introduction video is optional. Add a YouTube URL in the admin to show it; unsupported or blank URLs leave the section hidden.
13. The blog is enabled by default. Published posts support search, category filtering, expandable reading, and native sharing with a copy-link fallback. Posts have optional Hindi fields in addition to English and Arabic; a clinician should review health information and translations before publication. Changes deploy with the normal CMS deployment.
14. On mobile, the bottom navigation dock links to Home, Services, Shop, Booking, and Contact. The slide-out menu can be closed using its close button, the backdrop, Escape, or a navigation link.
15. Service booking links preselect the requested service on the appointment form. Appointment requests are not confirmed bookings; the clinic must contact the visitor to confirm a time unless a hosted scheduler is configured and its booking rules say otherwise.
16. Verify appointment requests, contact messages, and all contact links after deployment. Both forms are processed by Netlify Forms and require a Netlify deployment; they do not work when opening the HTML directly from disk.
17. The doctor's profile page can be shared as a contact card with the configured contact details and working schedule. Verify all clinic details and hours before sharing or publishing.
18. The Tools page includes an adult BMI estimate, an estimated due date, Gregorian/Hijri date conversion, and optional CMS-managed vaccination, prayer-time, Ramadan, and seasonal health information. Calculators run in the browser, are not diagnoses or treatment recommendations, and should be reviewed by the clinic before launch. Publish schedules only with current and verified sources. Pediatric medication-dose, infusion-rate, and disease-risk calculators remain excluded until clinician-approved formulas, ranges, and translations are supplied.
19. The appointment form can offer an `.ics` reminder for the visitor's preferred time after submission. This records a requested time only; it is not confirmation of a booking. Only date/time are temporarily held in the browser session to offer the download.
20. The public site registers a service worker only on HTTPS or localhost and caches the public shell for offline reading. It is not an installable PWA; form submissions, admin edits, external maps, and payment pages require connectivity.
21. The Accessibility control supports text scaling, a readable font, underlined links, high contrast, increased text spacing, reduced motion, and resetting preferences. Preferences are stored in the visitor's browser. Print styles hide navigation and forms while preserving page content.
22. On mobile, the bottom navigation dock links to Home, Services, Shop, Booking, and Contact. On desktop these quick links are in the header, and the menu includes Health Tools and the combined FAQ & Reviews page.
23. The Contact page offers a downloadable vCard when clinic contact details are configured. The home page emits MedicalClinic structured data only after the name and address are replaced with real clinic details.
24. The About page displays doctor social icons only for valid HTTPS profiles entered by the admin under Clinic Details → Social profile links. Blank or invalid profiles remain hidden.
25. The chatbot, symptom/service decision flows, medication tracker, accepted-insurance listing, Patient Information page, and separate Seasonal Tips page are not included in the public site. FAQ and consent-approved reviews share one page. Energy estimates and the 12/24-hour converter were removed at the clinic's request.

## Run locally

Open the folder in VS Code and use a static file server (for example, the Live Server extension), or serve it with any local static HTTP server. External fonts and Font Awesome require an internet connection. The language selector switches supported English, Arabic, and Hindi copy; Arabic uses RTL and Hindi remains LTR. Translate and review CMS-managed content in the admin for full localization.

## Deploy

- **Netlify Drop:** Drag the project folder into Netlify's manual deploy area.
- **Netlify Git:** Connect a Git repository and publish from the repository root.
- **GitHub Pages:** Publish the repository root as a static site.
- **Vercel:** Import the repository with no build command and the project root as the output directory.

Hosting providers' free tiers, limits, availability, and terms may change. A custom domain may cost money.

## Admin dashboard setup (Netlify)

The dashboard at `/admin/` is configured for Decap CMS with Netlify Identity and Git Gateway. To enable secure, site-wide editing:

1. Deploy this folder to Netlify from a connected Git repository. In `admin/config.yml`, set `backend.branch` to the branch Netlify deploys.
2. In Netlify, enable Identity and Git Gateway for the site. Keep registration invite-only and invite the clinic owner/admin.
3. Open `/admin/` on the deployed domain and sign in. Saving clinic settings or products commits the changes to Git and triggers the normal site deployment.

The dashboard is not authenticated or functional when opened directly from disk. On localhost, `/admin/` clearly links to the live admin because a static local server cannot provide Netlify Identity; public-page footers also include an Admin link. Global edits require the Git-backed Netlify setup. On the deployed `/admin/`, Decap CMS loads its standard editor and Identity login flow; after login, the page reloads so the editor initializes with the authenticated session. An existing Identity session resumes automatically in that browser. Netlify Identity keeps its session in browser storage, so it normally survives closing or restarting the computer. Logging out, clearing browser storage, using private browsing, or Netlify revoking/expiring the session will require signing in again. Page layout, general page copy, clinic policies, and other markup still require editing the corresponding HTML files.

If login reports an incorrect email or password, verify the account exists under this exact Netlify site's Identity → Users and that email confirmation is complete; Identity accounts are site-specific, not the visitor's Netlify dashboard or GitHub credentials. Use the Identity password recovery flow if necessary. If the editor never appears or Identity cannot load, verify that site-wide Visitor Access/password protection is disabled, the production deploy is published, Identity and Git Gateway are enabled, and `admin/config.yml` points at the connected repository's deployed branch (`main` here). Keep registration invite-only and limit Git Gateway roles to authorized editors.

The Netlify `_headers` file scopes `'unsafe-eval'` to `/admin` because Decap CMS evaluates its configuration at runtime. Public pages keep a separate Content Security Policy without `'unsafe-eval'`; do not move that permission into the global `/*` rule.

Identity's default confirmation and invitation emails return to the site root with an auth token. After confirming an address, visit `/admin/` and sign in; the admin page redirects to itself after login so Decap can load the authenticated session. If the Netlify plan supports custom Identity email templates and you want confirmation/invitation links to open the dashboard directly, use `{{ .SiteURL }}/admin/#confirmation_token={{ .Token }}` in the confirmation template and `{{ .SiteURL }}/admin/#invite_token={{ .Token }}` in the invitation template. Keep Identity registration invite-only; do not make public CMS registration available.

## Appearance

Visitors can switch between light and dark themes from the navigation menu. Their choice is saved in the browser; visitors without a saved choice follow their device's color-scheme preference.
