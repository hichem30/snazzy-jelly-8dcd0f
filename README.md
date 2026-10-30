# Dr. [Name] Clinic Website

A responsive HTML/CSS/JavaScript website for a private clinic in Kuwait. The public site is static; the clinic-owner dashboard at `/admin/` links into Decap CMS with Decap Turbo to publish changes through the connected GitHub repository. The small shop has a browser-persisted cart; orders can continue through WhatsApp, and optional myFatoorah-hosted payment links are available when enabled and configured by the clinic. Appointment requests open WhatsApp using the number configured in the clinic profile; contact messages use Netlify Forms when deployed on Netlify. The site supports English, Arabic, and Hindi; admin editing fields are English-only, retain existing translations, and use English text as a runtime fallback for untranslated new entries.

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
js/content/*.json   CMS data for the home page, clinic profile, hours, appointments, services, shop, blog, FAQs/reviews, and health information
service-worker.js   Offline cache for the public site shell
img/                Replaceable SVG portrait, testimonial, favicon, and product placeholders
admin/              Clinic-owner dashboard and Decap CMS editor
```

## Admin workspace

The authenticated Decap entry editor is wrapped by `js/admin-editor.js` to present clinic sections in one sidebar and edit their fields in one screen. Keep the `sections` route map in that file aligned with file collections in `admin/config.yml`. The custom controls patch Decap's current draft; the Decap toolbar remains responsible for saving and publishing. For image fields, **Choose from media library** reveals Decap's original media controls. New CMS fields are rendered from their Decap schema where possible; confirm any new widget type in the custom editor before relying on it.

## Customize before publishing

1. In the owner dashboard at `/admin/`, choose a clinic-specific area. The **Edit website** links open Decap CMS; its save and publish actions continue to use Decap Turbo.
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
13. The blog is enabled by default. Published posts support search, category filtering, expandable reading, and native sharing with a copy-link fallback. Existing translated article content remains on the site, but editors only manage the English fields; a clinician should review health information before publication. Changes deploy with the normal CMS deployment.
14. On mobile, the bottom navigation dock links to Home, Services, Shop, Booking, and Contact. The slide-out menu can be closed using its close button, the backdrop, Escape, or a navigation link.
15. Service booking links preselect the requested service on the appointment form. The service choices follow enabled services in the admin. The appointment form opens a WhatsApp draft containing the request details; visitors must review and send it themselves. Appointment requests are not confirmed bookings.
16. Verify the WhatsApp number and appointment handoff after deployment. Contact messages are processed by Netlify Forms and require a Netlify deployment; they do not work when opening the HTML directly from disk.
17. The doctor's profile page can be shared as a contact card with the configured contact details and working schedule. Verify all clinic details and hours before sharing or publishing.
18. The Tools page includes an adult BMI estimate, an estimated due date, Gregorian/Hijri date conversion, and optional CMS-managed vaccination, prayer-time, Ramadan, and seasonal health information. Calculators run in the browser, are not diagnoses or treatment recommendations, and should be reviewed by the clinic before launch. Publish schedules only with current and verified sources. Pediatric medication-dose, infusion-rate, and disease-risk calculators remain excluded until clinician-approved formulas, ranges, and translations are supplied.
19. After opening the appointment request in WhatsApp, the form can offer an `.ics` reminder for the visitor's preferred date and time. This records a requested time only; it is not confirmation of a booking. Date and time remain in the page only to create the reminder.
20. The public site registers a service worker only on HTTPS or localhost and caches the public shell for offline reading. It is not an installable PWA; form submissions, admin edits, external maps, and payment pages require connectivity.
21. The Accessibility control supports text scaling, a readable font, underlined links, high contrast, increased text spacing, reduced motion, and resetting preferences. Preferences are stored in the visitor's browser. Print styles hide navigation and forms while preserving page content.
22. On mobile, the bottom navigation dock links to Home, Services, Shop, Booking, and Contact. On desktop these quick links are in the header, and the menu includes Health Tools and the combined FAQ & Reviews page.
23. The Contact page offers a downloadable vCard when clinic contact details are configured. The home page emits MedicalClinic structured data only after the name and address are replaced with real clinic details.
24. The About page displays doctor social icons only for valid HTTPS profiles entered under **Clinic profile & contact → Social media links**. Blank or invalid profiles remain hidden.
25. The chatbot, symptom/service decision flows, medication tracker, accepted-insurance listing, Patient Information page, and separate Seasonal Tips page are not included in the public site. FAQ and consent-approved reviews share one page. Energy estimates and the 12/24-hour converter were removed at the clinic's request.

## Run locally

Open the folder in VS Code and use a static file server (for example, the Live Server extension), or serve it with any local static HTTP server. External fonts and Font Awesome require an internet connection. The language selector switches supported English, Arabic, and Hindi copy; Arabic uses RTL and Hindi remains LTR. CMS-managed translated content is maintained separately from the English editor fields.

## Deploy

- **Netlify Drop:** Drag the project folder into Netlify's manual deploy area.
- **Netlify Git:** Connect a Git repository and publish from the repository root.
- **GitHub Pages:** Publish the repository root as a static site.
- **Vercel:** Import the repository with no build command and the project root as the output directory.

Hosting providers' free tiers, limits, availability, and terms may change. A custom domain may cost money.

## Admin dashboard setup (Netlify + Decap Turbo)

The owner dashboard at `/admin/` links into Decap CMS at `/admin/editor.html`, which uses the hosted Decap Turbo backend. Website content remains in the connected GitHub repository and Netlify continues to deploy the `main` branch; editors sign in to Turbo, not GitHub or Netlify. Before enabling the dashboard:

1. Create a Decap Turbo account and organization at [turbo.decapcms.org](https://turbo.decapcms.org/). The Free plan currently includes one site and one user seat.
2. In Turbo, connect GitHub and install the Decap Turbo GitHub App on `hichem30/snazzy-jelly-8dcd0f`, granting access to this repository.
3. Create a Turbo site for `hichem30/snazzy-jelly-8dcd0f`, branch `main`, and config path `admin/config.yml`. Add `https://snazzy-jelly-8dcd0f.netlify.app/admin/editor.html` as the admin interface URL, then copy the site ID from its Overview page.
4. Put the copied site ID in `admin/config.yml` as `backend.turbo_site_id` and deploy the change to Netlify.
5. Add the clinic owner as a member of that Turbo site. They can then open `/admin/`, choose **Edit website**, sign in to Turbo, and edit the clinic-specific sections. Saving changes commits to GitHub and triggers the usual Netlify production deployment.

The owner dashboard at `/admin/` is the clinic-specific home screen. Each task card opens its corresponding collection in `/admin/editor.html`; the editor retains Decap Turbo's authentication and save/publish controls. The editor opens with its preview collapsed to give the form more space; use the preview toggle when you want to inspect it. The owner does not need to use the GitHub or Netlify dashboards for routine CMS edits, but an administrator may still need to maintain the Turbo/GitHub connection or troubleshoot failed deployments. On localhost, dashboard links open the live editor because local preview cannot authenticate or publish.

The Turbo Free plan is limited to one site and one seat, so it fits only if one person needs an account. Invite only authorized editors. Netlify's `_headers` file scopes `'unsafe-eval'` to `/admin` because Decap CMS evaluates its configuration at runtime; it also permits the Turbo control plane and Supabase endpoints used by the hosted backend. Public pages keep a separate Content Security Policy without `'unsafe-eval'`.

### Admin dashboard design and extension

The owner dashboard uses clinic-specific task cards, not CMS terminology. In the editor, the top-level generic navigation is hidden; uploaded images are selected from the relevant doctor or product setting. Native save/publish and Turbo authentication remain in place, so the owner-facing interface does not create a second publishing system. `css/admin-style.css` contains both the dashboard design and the editor's clinic-colored, responsive layout.

The dashboard links to clinic profile, opening hours, home-page sections, appointments, services, shop and products, blog articles, FAQs and reviews, health information, and website settings. English editor fields are visible; hidden translated values remain in the JSON so existing Arabic and Hindi copy is preserved. The home-page editor controls its hero copy and which sections display. Appointment settings control the hosted booking URL, request form, preferred date/time and notes fields, confirmation copy, and optional calendar reminder.

```text
┌──────────────────────────────────────────────────────┐
│ Clinic Website Dashboard     View website  Edit site │
├──────────────────────────────────────────────────────┤
│ What would you like to update?                       │
│ Clinic profile | Opening hours | Home page           │
│ Appointments    | Services       | Shop & products    │
│ Blog articles   | FAQs & reviews| Health information │
│ Website settings                                   │
│ How updates work and important publishing reminders │
└──────────────────────────────────────────────────────┘
```

To add a CMS section, add the JSON file under `js/content/`, include it in `js/data.js` and `service-worker.js`, add its Decap collection to `admin/config.yml`, then add a clinic-specific task card to `admin/index.html`. Keep translated keys hidden in the CMS schema. Do not expose chatbot, medication-tracker, symptom/service decision-flow, accepted-insurance, separate Patient Information, or Seasonal Tips controls; those features were removed.

## Appearance

Visitors can switch between light and dark themes from the navigation menu. Their choice is saved in the browser; visitors without a saved choice follow their device's color-scheme preference.
